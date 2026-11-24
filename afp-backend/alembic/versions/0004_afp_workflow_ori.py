"""Create independent local ORI storage; retain historical AFP/ORI data.

Revision ID: 0004_afp_workflow_ori
Revises: 0003_reflex_triceps

This migration does not delete previous 'additionalInformation' JSONB sections
or legacy relational ORI fields from AFP investigations. Ownership/linkage of
historical ORI data must be reconciled later with the approved NDSS design.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "0004_afp_workflow_ori"
down_revision = "0003_reflex_triceps"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ori_records",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("payload", JSONB(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True),
            server_default=sa.func.now(), nullable=False,
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True),
            server_default=sa.func.now(), nullable=False,
        ),
        sa.CheckConstraint("jsonb_typeof(payload) = 'object'", name="ck_ori_payload_object"),
    )


def downgrade() -> None:
    # Prevent accidental loss of ORI records during a database downgrade.
    connection = op.get_bind()
    if connection.execute(sa.text("SELECT EXISTS (SELECT 1 FROM ori_records)" )).scalar():
        raise RuntimeError(
            "Cannot downgrade while ori_records contains data; retain or "
            "explicitly migrate those records first."
        )
    op.drop_table("ori_records")
