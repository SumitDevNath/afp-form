
"""Create provisional AFP-owned investigation tables.

Revision ID: 0001_afp_owned
Revises:
"""

from collections.abc import Iterable

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_afp_owned"
down_revision = None
branch_labels = None
depends_on = None


def _strings(
    names: Iterable[str],
    length: int,
) -> list[sa.Column]:
    return [
        sa.Column(name, sa.String(length), nullable=True)
        for name in names
    ]


def _choices(
    prefix: str,
    names: Iterable[str],
    values: tuple[str, ...],
) -> list[sa.CheckConstraint]:
    permitted = ", ".join(f"'{value}'" for value in values)

    return [
        sa.CheckConstraint(
            f"{name} IN ({permitted})",
            name=f"ck_{prefix}_{name}",
        )
        for name in names
    ]


def upgrade() -> None:
    op.create_table(
        "afp_investigations",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),

        # Clinical screening
        *_strings(
            (
                "paralysis_present",
                "paralysis_flaccid",
                "paralysis_sudden_onset",
                "paralysis_caused_by_injury",
                "paralysis_present_at_birth",
            ),
            3,
        ),
        sa.Column("paralysis_onset_date", sa.Date(), nullable=True),
        sa.Column(
            "screening_diagnosis",
            sa.String(250),
            nullable=True,
        ),

        # Signs / symptoms
        *_strings(
            (
                "fever_when_paralysis_began",
                "muscle_pain_when_paralysis_began",
                "paralysis_asymmetric",
                "paralysis_moved_upward",
                "sensation_present_at_paralysis_site",
                "child_at_health_facility",
            ),
            7,
        ),
        sa.Column(
            "site_of_paralysis",
            postgresql.ARRAY(sa.String(12)),
            server_default=sa.text("'{}'::varchar[]"),
            nullable=False,
        ),
        sa.Column(
            "other_paralysis_site",
            sa.String(150),
            nullable=True,
        ),
        sa.Column(
            "selected_facility_option",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "other_facility_name",
            sa.String(200),
            nullable=True,
        ),
        sa.Column(
            "health_facility_notification_date",
            sa.Date(),
            nullable=True,
        ),
        sa.Column(
            "medical_record_number",
            sa.String(100),
            nullable=True,
        ),

        # AFP-specific DSFP / SIMO notification
        sa.Column(
            "notified_to_concerned_dsfp_simo",
            sa.Boolean(),
            nullable=True,
        ),
        sa.Column(
            "dsfp_simo_notification_date",
            sa.Date(),
            nullable=True,
        ),

        # Contact summary
        sa.Column(
            "first_contact_category",
            sa.String(20),
            nullable=True,
        ),
        sa.Column(
            "first_contact_category_other",
            sa.String(150),
            nullable=True,
        ),
        sa.Column(
            "additional_comments",
            sa.String(1000),
            nullable=True,
        ),
        sa.Column(
            "suspected_diagnosis",
            sa.Text(),
            nullable=True,
        ),

        # Additional information
        sa.Column(
            "search_for_additional_cases",
            sa.String(7),
            nullable=True,
        ),
        sa.Column(
            "additional_cases_identified",
            sa.String(3),
            nullable=True,
        ),
        sa.Column(
            "number_of_additional_cases",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "outbreak_response_immunization_done",
            sa.String(7),
            nullable=True,
        ),
        sa.Column(
            "number_of_children_vaccinated",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "outbreak_response_explanation",
            sa.String(500),
            nullable=True,
        ),

        # Allowed-value constraints
        *_choices(
            "afp_inv",
            (
                "paralysis_present",
                "paralysis_flaccid",
                "paralysis_sudden_onset",
                "paralysis_caused_by_injury",
                "paralysis_present_at_birth",
                "additional_cases_identified",
            ),
            ("yes", "no"),
        ),
        *_choices(
            "afp_inv",
            (
                "fever_when_paralysis_began",
                "muscle_pain_when_paralysis_began",
                "paralysis_asymmetric",
                "paralysis_moved_upward",
                "sensation_present_at_paralysis_site",
                "child_at_health_facility",
            ),
            ("yes", "no", "unknown"),
        ),
        *_choices(
            "afp_inv",
            (
                "search_for_additional_cases",
                "outbreak_response_immunization_done",
            ),
            ("yes", "no", "pending"),
        ),
        sa.CheckConstraint(
            "first_contact_category IN ("
            "'Regd doctor','GoB facility','Village doctor',"
            "'NGO Clinic','Homeopath','Kabiraj','Imam',"
            "'Pharmacist','HA','FWA','Other')",
            name="ck_afp_inv_first_contact_category",
        ),
        sa.CheckConstraint(
            "site_of_paralysis <@ ARRAY["
            "'right_arm','left_arm','right_leg','left_leg',"
            "'neck','face','other']::varchar[]",
            name="ck_afp_inv_site_of_paralysis_values",
        ),
        sa.CheckConstraint(
            "number_of_additional_cases >= 0",
            name="ck_afp_inv_additional_count",
        ),
        sa.CheckConstraint(
            "number_of_children_vaccinated >= 0",
            name="ck_afp_inv_vaccinated_count",
        ),
    )

    # Clinical examination
    reflex_columns = (
        "right_biceps",
        "left_biceps",
        "right_brachioradialis",
        "left_brachioradialis",
        "right_patellar",
        "left_patellar",
        "right_achilles",
        "left_achilles",
    )

    muscle_groups = (
        "upper_flex_wrist",
        "upper_extend_wrist",
        "upper_flex_elbow",
        "upper_extend_elbow",
        "upper_flex_shoulder",
        "upper_extend_shoulder",
        "upper_hand_grip",
        "lower_flex_hip",
        "lower_extend_hip",
        "lower_flex_knee",
        "lower_extend_knee",
        "lower_flex_ankle",
        "lower_extend_ankle",
    )

    muscle_columns = tuple(
        f"{muscle}_{side}"
        for muscle in muscle_groups
        for side in ("right", "left")
    )

    op.create_table(
        "afp_clinical_examinations",

        sa.Column(
            "investigation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey(
                "afp_investigations.id",
                ondelete="CASCADE",
            ),
            primary_key=True,
        ),

        *_strings(reflex_columns, 2),
        *_strings(
            ("right_plantar_reflex", "left_plantar_reflex"),
            9,
        ),
        *(
            sa.Column(name, sa.SmallInteger(), nullable=True)
            for name in muscle_columns
        ),

        *_choices(
            "afp_exam",
            reflex_columns,
            ("0", "1+", "2+", "3+", "4+"),
        ),
        *(
            sa.CheckConstraint(
                f"{name} BETWEEN 0 AND 5",
                name=f"ck_afp_exam_{name}",
            )
            for name in muscle_columns
        ),
        sa.CheckConstraint(
            "right_plantar_reflex IN "
            "('flexor', 'extensor', 'equivocal')",
            name="ck_afp_exam_right_plantar",
        ),
        sa.CheckConstraint(
            "left_plantar_reflex IN "
            "('flexor', 'extensor', 'equivocal')",
            name="ck_afp_exam_left_plantar",
        ),
    )

    # Repeatable healthcare contacts
    op.create_table(
        "afp_healthcare_contacts",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "investigation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey(
                "afp_investigations.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),
        sa.Column(
            "client_id",
            sa.String(255),
            nullable=False,
        ),
        sa.Column(
            "position",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "provider_name",
            sa.String(250),
            nullable=True,
        ),
        sa.Column(
            "address",
            sa.String(500),
            nullable=True,
        ),
        sa.Column(
            "date_case_visited",
            sa.Date(),
            nullable=True,
        ),
        sa.Column(
            "already_in_network",
            sa.String(7),
            nullable=True,
        ),
        sa.Column(
            "reported_case",
            sa.String(3),
            nullable=True,
        ),
        sa.Column(
            "action_taken_planned",
            sa.String(500),
            nullable=True,
        ),

        sa.UniqueConstraint(
            "investigation_id",
            "client_id",
            name="uq_afp_contact_client_id",
        ),
        sa.UniqueConstraint(
            "investigation_id",
            "position",
            name="uq_afp_contact_position",
        ),
        sa.CheckConstraint(
            "position >= 0",
            name="ck_afp_contact_position",
        ),
        sa.CheckConstraint(
            "already_in_network IN ('yes', 'no', 'unknown')",
            name="ck_afp_contact_network",
        ),
        sa.CheckConstraint(
            "reported_case IN ('yes', 'no')",
            name="ck_afp_contact_reported",
        ),
    )


def downgrade() -> None:
    op.drop_table("afp_healthcare_contacts")
    op.drop_table("afp_clinical_examinations")
    op.drop_table("afp_investigations")
