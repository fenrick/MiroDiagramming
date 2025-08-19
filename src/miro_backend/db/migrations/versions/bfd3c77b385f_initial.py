"""initial

Revision ID: bfd3c77b385f
Revises:
Create Date: 2025-08-16 13:19:50.738055

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "bfd3c77b385f"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:  # pragma: no cover - migration code
    """Create initial tables."""

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("access_token", sa.String(), nullable=False),
        sa.Column("refresh_token", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_users_user_id"), "users", ["user_id"], unique=True)

    op.create_table(
        "cache_entries",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
    )
    op.create_index(op.f("ix_cache_entries_key"), "cache_entries", ["key"], unique=True)

    op.create_table(
        "idempotency",
        sa.Column("key", sa.String(), primary_key=True),
        sa.Column("response", sa.JSON(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
    )


def downgrade() -> None:  # pragma: no cover - migration code
    """Drop tables created in upgrade."""

    op.drop_table("idempotency")
    op.drop_index(op.f("ix_cache_entries_key"), table_name="cache_entries")
    op.drop_table("cache_entries")
    op.drop_index(op.f("ix_users_user_id"), table_name="users")
    op.drop_table("users")
