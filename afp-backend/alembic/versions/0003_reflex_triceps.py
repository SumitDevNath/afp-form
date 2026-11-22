"""Add right/left triceps reflex and preserve historical frontend snapshots.

Revision ID: 0003_reflex_triceps
Revises: 0002_local_full_payload

Existing measurements remain unchanged. Older JSONB snapshots gain
JSON null for the two previously unrecorded scores (not clinical results).
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_reflex_triceps"
down_revision = "0002_local_full_payload"
branch_labels = None
depends_on = None

TABLE = "afp_clinical_examinations"


def upgrade() -> None:
    for side in ("right", "left"):
        column = f"{side}_triceps"
        op.add_column(
            TABLE,
            sa.Column(column, sa.String(length=2), nullable=True),
        )
        op.create_check_constraint(
            f"ck_afp_exam_{column}",
            TABLE,
            f"{column} IN ('0', '1+', '2+', '3+', '4+')",
        )

    # Add only MISSING properties to existing full-form JSONB snapshots.
    # Preserve all other data and any triceps value already present.
    op.execute(sa.text("""
        UPDATE afp_investigations
        SET frontend_payload = jsonb_set(
            frontend_payload,
            '{clinicalExamination,reflexes,scores}',
            (frontend_payload #> '{clinicalExamination,reflexes,scores}')
            || CASE
                WHEN (frontend_payload #> '{clinicalExamination,reflexes,scores}')
                     ? 'rightTriceps'
                THEN '{}'::jsonb
                ELSE '{"rightTriceps": null}'::jsonb
               END
            || CASE
                WHEN (frontend_payload #> '{clinicalExamination,reflexes,scores}')
                     ? 'leftTriceps'
                THEN '{}'::jsonb
                ELSE '{"leftTriceps": null}'::jsonb
               END,
            false
        )
        WHERE jsonb_typeof(
            frontend_payload #> '{clinicalExamination,reflexes,scores}'
        ) = 'object'
    """))


def downgrade() -> None:
    # Never silently lose clinical measurements during a downgrade.
    connection = op.get_bind()
    has_data = connection.execute(sa.text("""
        SELECT
          EXISTS (
            SELECT 1 FROM afp_clinical_examinations
            WHERE right_triceps IS NOT NULL OR left_triceps IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM afp_investigations
            WHERE (
                frontend_payload #> '{clinicalExamination,reflexes,scores,rightTriceps}'
            ) IS DISTINCT FROM NULL
              AND (
                frontend_payload #> '{clinicalExamination,reflexes,scores,rightTriceps}'
              ) <> 'null'::jsonb
            OR (
                frontend_payload #> '{clinicalExamination,reflexes,scores,leftTriceps}'
            ) IS DISTINCT FROM NULL
              AND (
                frontend_payload #> '{clinicalExamination,reflexes,scores,leftTriceps}'
              ) <> 'null'::jsonb
          )
    """)).scalar_one()
    if has_data:
        raise RuntimeError(
            "Downgrade refused: recorded triceps values would be lost."
        )

    # When all triceps values are missing or null, remove only those two
    # snapshot properties so the older strict Pydantic schema can read them.
    op.execute(sa.text("""
        UPDATE afp_investigations
        SET frontend_payload = jsonb_set(
            frontend_payload,
            '{clinicalExamination,reflexes,scores}',
            (frontend_payload #> '{clinicalExamination,reflexes,scores}')
                - 'rightTriceps' - 'leftTriceps',
            false
        )
        WHERE jsonb_typeof(
            frontend_payload #> '{clinicalExamination,reflexes,scores}'
        ) = 'object'
    """))

    for side in ("right", "left"):
        column = f"{side}_triceps"
        op.drop_constraint(f"ck_afp_exam_{column}", TABLE, type_="check")
        op.drop_column(TABLE, column)
