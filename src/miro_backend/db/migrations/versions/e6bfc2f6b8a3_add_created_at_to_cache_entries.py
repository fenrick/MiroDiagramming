"""add created_at to cache_entries

Revision ID: e6bfc2f6b8a3
Revises: a54a1dc7f72e
Create Date: 2025-08-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "e6bfc2f6b8a3"
down_revision: Union[str, Sequence[str], None] = "a54a1dc7f72e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:  # pragma: no cover - migration code
    op.add_column(
        "cache_entries",
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
    )


def downgrade() -> None:  # pragma: no cover - migration code
    op.drop_column("cache_entries", "created_at")
