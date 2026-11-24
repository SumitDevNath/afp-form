"""Remove ORI from AFP investigation storage and archive historical values.

Revision ID: 0005_remove_ori_from_afp
Revises: 0004_afp_workflow_ori

Business rule: ORI is an independent NDSS module, never an AFP section.

Legacy data is copied into legacy_afp_ori_archive for reconciliation BEFORE
any columns or JSONB keys are removed from afp_investigations. The archive
is deliberately NOT an operational ORI record and has no foreign key to AFP.
Do not automatically attach archived legacy values to an ori_records row.

Downgrade is blocked when archived data exists to avoid destructive rollback.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID


revision = "0005_remove_ori_from_afp"
down_revision = "0004_afp_workflow_ori"
branch_labels = None
depends_on = None


ORI_COLUMNS = (
    "search_for_additional_cases",
    "additional_cases_identified",
    "number_of_additional_cases",
    "outbreak_response_immunization_done",
    "number_of_children_vaccinated",
    "outbreak_response_explanation",
)

ORI_CONSTRAINTS = (
    "ck_afp_inv_search_for_additional_cases",
    "ck_afp_inv_additional_cases_identified",
    "ck_afp_inv_additional_count",
    "ck_afp_inv_outbreak_response_immunization_done",
    "ck_afp_inv_vaccinated_count",
)


def upgrade() -> None:
    op.create_table(
        "legacy_afp_ori_archive",
        sa.Column(
            "source_afp_investigation_id",
            PG_UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column("relational_payload", JSONB(), nullable=True),
        sa.Column("snapshot_payload", JSONB(), nullable=True),
        sa.Column(
            "archived_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # Save only legacy rows that contain ORI in at least one storage location.
    # Keeping both representations avoids choosing which historical value is
    # authoritative when relational columns and JSONB snapshots differ.
    op.execute(
        sa.text(
            """
            INSERT INTO legacy_afp_ori_archive (
                source_afp_investigation_id,
                relational_payload,
                snapshot_payload
            )
            SELECT
                id,
                CASE WHEN
                    search_for_additional_cases IS NOT NULL OR
                    additional_cases_identified IS NOT NULL OR
                    number_of_additional_cases IS NOT NULL OR
                    outbreak_response_immunization_done IS NOT NULL OR
                    number_of_children_vaccinated IS NOT NULL OR
                    outbreak_response_explanation IS NOT NULL
                THEN jsonb_build_object(
                    'searchForAdditionalCases', search_for_additional_cases,
                    'additionalCasesIdentified', additional_cases_identified,
                    'numberOfAdditionalCases', number_of_additional_cases,
                    'outbreakResponseImmunizationDone', outbreak_response_immunization_done,
                    'numberOfChildrenVaccinated', number_of_children_vaccinated,
                    'outbreakResponseExplanation', outbreak_response_explanation
                )
                ELSE NULL END,
                CASE WHEN frontend_payload ? 'additionalInformation'
                     THEN frontend_payload -> 'additionalInformation'
                     ELSE NULL END
            FROM afp_investigations
            WHERE
                search_for_additional_cases IS NOT NULL OR
                additional_cases_identified IS NOT NULL OR
                number_of_additional_cases IS NOT NULL OR
                outbreak_response_immunization_done IS NOT NULL OR
                number_of_children_vaccinated IS NOT NULL OR
                outbreak_response_explanation IS NOT NULL OR
                (frontend_payload ? 'additionalInformation')
            """
        )
    )

    # Remove the legacy nested ORI object even from earlier JSONB snapshots.
    op.execute(
        sa.text(
            """
            UPDATE afp_investigations
            SET frontend_payload = frontend_payload - 'additionalInformation'
            WHERE frontend_payload ? 'additionalInformation'
            """
        )
    )

    # Reject future attempts to embed ORI in AFP JSONB snapshots at DB level.
    op.create_check_constraint(
        "ck_afp_inv_no_ori_section",
        "afp_investigations",
        "frontend_payload IS NULL OR "
        "NOT (frontend_payload ? 'additionalInformation')",
    )

    # Checks referencing the old columns must go before the columns themselves.
    for constraint in ORI_CONSTRAINTS:
        op.drop_constraint(
            constraint,
            "afp_investigations",
            type_="check",
        )

    for column in ORI_COLUMNS:
        op.drop_column("afp_investigations", column)


def downgrade() -> None:
    # Never remove the archive or reinstate a misleading AFP/ORI schema while
    # it contains historical information. Reconciliation is a manual decision.
    connection = op.get_bind()
    archived = connection.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM legacy_afp_ori_archive)"
        )
    ).scalar()

    if archived:
        raise RuntimeError(
            "Downgrade blocked: legacy_afp_ori_archive contains historical "
            "ORI data. Plan a reviewed restoration before downgrading."
        )

    op.drop_constraint(
        "ck_afp_inv_no_ori_section",
        "afp_investigations",
        type_="check",
    )

    op.add_column(
        "afp_investigations",
        sa.Column("search_for_additional_cases", sa.String(7), nullable=True),
    )
    op.add_column(
        "afp_investigations",
        sa.Column("additional_cases_identified", sa.String(3), nullable=True),
    )
    op.add_column(
        "afp_investigations",
        sa.Column("number_of_additional_cases", sa.Integer(), nullable=True),
    )
    op.add_column(
        "afp_investigations",
        sa.Column("outbreak_response_immunization_done", sa.String(7), nullable=True),
    )
    op.add_column(
        "afp_investigations",
        sa.Column("number_of_children_vaccinated", sa.Integer(), nullable=True),
    )
    op.add_column(
        "afp_investigations",
        sa.Column("outbreak_response_explanation", sa.String(500), nullable=True),
    )

    op.create_check_constraint(
        "ck_afp_inv_search_for_additional_cases",
        "afp_investigations",
        "search_for_additional_cases IN ('yes','no','pending')",
    )
    op.create_check_constraint(
        "ck_afp_inv_additional_cases_identified",
        "afp_investigations",
        "additional_cases_identified IN ('yes','no')",
    )
    op.create_check_constraint(
        "ck_afp_inv_additional_count",
        "afp_investigations",
        "number_of_additional_cases >= 0",
    )
    op.create_check_constraint(
        "ck_afp_inv_outbreak_response_immunization_done",
        "afp_investigations",
        "outbreak_response_immunization_done IN ('yes','no','pending')",
    )
    op.create_check_constraint(
        "ck_afp_inv_vaccinated_count",
        "afp_investigations",
        "number_of_children_vaccinated >= 0",
    )

    op.drop_table("legacy_afp_ori_archive")
