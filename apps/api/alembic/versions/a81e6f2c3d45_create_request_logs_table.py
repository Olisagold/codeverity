"""create request_logs table

Revision ID: a81e6f2c3d45
Revises: 7c3d5e9a1b24
Create Date: 2026-10-02 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a81e6f2c3d45'
down_revision: Union[str, Sequence[str], None] = '7c3d5e9a1b24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('request_logs',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('public_id', sa.String(length=40), nullable=False),
    sa.Column('organization_id', sa.Uuid(), nullable=False),
    sa.Column('api_key_id', sa.Uuid(), nullable=True),
    sa.Column('environment', sa.Enum('live', 'test', name='apikeyenvironment', native_enum=False, length=10), nullable=False),
    sa.Column('method', sa.String(length=10), nullable=False),
    sa.Column('path', sa.String(length=500), nullable=False),
    sa.Column('status_code', sa.Integer(), nullable=False),
    sa.Column('duration_ms', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['api_key_id'], ['api_keys.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_request_logs_org_created', 'request_logs', ['organization_id', 'created_at'], unique=False)
    op.create_index(op.f('ix_request_logs_api_key_id'), 'request_logs', ['api_key_id'], unique=False)
    op.create_index(op.f('ix_request_logs_created_at'), 'request_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_request_logs_public_id'), 'request_logs', ['public_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('request_logs')
