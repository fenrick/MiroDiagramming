"""add status, claimed_at and attempts to queue tasks

Revision ID: a54a1dc7f72e
Revises: 78b2ba4eb105
Create Date: 2025-08-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a54a1dc7f72e"
down_revision: Union[str, Sequence[str], None] = "78b2ba4eb105"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:  # pragma: no cover - migration code
    op.add_column(
        "queue_tasks",
        sa.Column("status", sa.String(), nullable=False, server_default="queued"),
    )
    op.add_column(
        "queue_tasks",
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "queue_tasks",
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index(
        op.f("ix_queue_tasks_status"), "queue_tasks", ["status"], unique=False
    )


def downgrade() -> None:  # pragma: no cover - migration code
    op.drop_index(op.f("ix_queue_tasks_status"), table_name="queue_tasks")
    op.drop_column("queue_tasks", "attempts")
    op.drop_column("queue_tasks", "claimed_at")
    op.drop_column("queue_tasks", "status")
