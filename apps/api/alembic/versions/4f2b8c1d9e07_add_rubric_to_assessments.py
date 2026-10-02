"""add rubric to assessments

Revision ID: 4f2b8c1d9e07
Revises: 3be1935f3610
Create Date: 2026-10-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4f2b8c1d9e07'
down_revision: Union[str, Sequence[str], None] = '3be1935f3610'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('assessments', sa.Column('rubric', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('assessments', sa.Column('rubric_score', sa.Float(), nullable=True))
    op.add_column('assessments', sa.Column('rubric_scores', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('assessments', 'rubric_scores')
    op.drop_column('assessments', 'rubric_score')
    op.drop_column('assessments', 'rubric')
