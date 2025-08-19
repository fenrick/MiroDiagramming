"""add jobs, boards, shapes and tags tables

Revision ID: 78b2ba4eb105
Revises: bfd3c77b385f
Create Date: 2025-08-17 04:45:29.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "78b2ba4eb105"
down_revision: Union[str, Sequence[str], None] = "bfd3c77b385f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:  # pragma: no cover - migration code
    """Create tables for jobs, boards, shapes and tags."""
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("results", sa.JSON(), nullable=True),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
    )

    op.create_table(
        "boards",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("board_id", sa.String(), nullable=True),
        sa.Column("owner_id", sa.String(), nullable=True),
    )
    op.create_index(op.f("ix_boards_name"), "boards", ["name"], unique=True)
    op.create_index(op.f("ix_boards_board_id"), "boards", ["board_id"], unique=True)

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("board_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
    )
    op.create_index(op.f("ix_tags_board_id"), "tags", ["board_id"], unique=False)
    op.create_index(op.f("ix_tags_name"), "tags", ["name"], unique=False)
    op.create_foreign_key(
        None, "tags", "boards", ["board_id"], ["id"], ondelete="CASCADE"
    )

    op.create_table(
        "shapes",
        sa.Column("board_id", sa.String(), nullable=False),
        sa.Column("shape_id", sa.String(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("board_id", "shape_id"),
    )
    op.create_foreign_key(
        None, "shapes", "boards", ["board_id"], ["board_id"], ondelete="CASCADE"
    )


def downgrade() -> None:  # pragma: no cover - migration code
    """Drop tables created in upgrade."""
    op.drop_table("shapes")
    op.drop_index(op.f("ix_tags_name"), table_name="tags")
    op.drop_index(op.f("ix_tags_board_id"), table_name="tags")
    op.drop_table("tags")
    op.drop_index(op.f("ix_boards_board_id"), table_name="boards")
    op.drop_index(op.f("ix_boards_name"), table_name="boards")
    op.drop_table("boards")
    op.drop_table("jobs")
