
"""Add complete local AFP form snapshot.

Revision ID: 0002_local_full_payload
Revises: 0001_afp_owned

This is provisional local development storage, not an NDSS schema.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "0002_local_full_payload"
down_revision = "0001_afp_owned"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nullable so existing Phase 3 rows are preserved without inventing data.
    op.add_column(
        "afp_investigations",
        sa.Column(
            "frontend_payload",
            JSONB(),
            nullable=True,
        ),
    )

    op.create_check_constraint(
        "ck_afp_inv_frontend_payload_object",
        "afp_investigations",
        "frontend_payload IS NULL OR "
        "jsonb_typeof(frontend_payload) = 'object'",
    )


def downgrade() -> None:
    # WARNING: Removes complete snapshots.
    # Use only on disposable development/test databases.
    op.drop_constraint(
        "ck_afp_inv_frontend_payload_object",
        "afp_investigations",
        type_="check",
    )

    op.drop_column(
        "afp_investigations",
        "frontend_payload",
    )
