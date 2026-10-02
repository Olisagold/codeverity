"""add quickstart columns to organizations

Revision ID: d4e7a2b9c013
Revises: a81e6f2c3d45
Create Date: 2026-10-02 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd4e7a2b9c013'
down_revision: Union[str, Sequence[str], None] = 'a81e6f2c3d45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'organizations', sa.Column('first_result_viewed_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        'organizations', sa.Column('quickstart_dismissed_at', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('organizations', 'quickstart_dismissed_at')
    op.drop_column('organizations', 'first_result_viewed_at')
