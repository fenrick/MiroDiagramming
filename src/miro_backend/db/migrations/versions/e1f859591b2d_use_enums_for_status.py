"""use enums for job and task status

Revision ID: e1f859591b2d
Revises: a54a1dc7f72e
Create Date: 2025-08-17 00:00:01.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "e1f859591b2d"
down_revision: Union[str, Sequence[str], None] = "a54a1dc7f72e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


job_status = sa.Enum(
    "queued", "running", "succeeded", "failed", name="jobstatus", native_enum=False
)
task_status = sa.Enum(
    "queued", "processing", "completed", "failed", name="taskstatus", native_enum=False
)


def upgrade() -> None:
    op.alter_column(
        "jobs", "status", existing_type=sa.String(), type_=job_status, nullable=False
    )
    op.alter_column(
        "queue_tasks",
        "status",
        existing_type=sa.String(),
        type_=task_status,
        nullable=False,
        server_default=sa.text("'queued'"),
        existing_server_default=sa.text("'queued'"),
    )


def downgrade() -> None:
    op.alter_column(
        "queue_tasks",
        "status",
        existing_type=task_status,
        type_=sa.String(),
        nullable=False,
        server_default="queued",
    )
    op.alter_column(
        "jobs", "status", existing_type=job_status, type_=sa.String(), nullable=False
    )
    job_status.drop(op.get_bind(), checkfirst=False)
    task_status.drop(op.get_bind(), checkfirst=False)
