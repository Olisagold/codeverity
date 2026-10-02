"""add public ids

Replaces UUIDs in the API with prefixed IDs like org_01J9Z3K4X8QH7N2V5T6B0C1D2E.
Existing rows are backfilled; UUIDs stay as internal primary keys.

Revision ID: b5c7d9e1f234
Revises: d4e7a2b9c013
Create Date: 2026-10-02 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.core.ids import new_id

# revision identifiers, used by Alembic.
revision: str = 'b5c7d9e1f234'
down_revision: Union[str, Sequence[str], None] = 'd4e7a2b9c013'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = {
    'organizations': 'org',
    'users': 'usr',
    'api_keys': 'key',
    'webhook_endpoints': 'whk',
    'webhook_deliveries': 'dlv',
}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    for table, prefix in TABLES.items():
        op.add_column(table, sa.Column('public_id', sa.String(length=40), nullable=True))
        ids = bind.execute(sa.text(f'SELECT id FROM {table}')).scalars().all()
        for row_id in ids:
            bind.execute(
                sa.text(f'UPDATE {table} SET public_id = :public_id WHERE id = :id'),
                {'public_id': new_id(prefix), 'id': row_id},
            )
        op.alter_column(table, 'public_id', nullable=False)
        op.create_index(op.f(f'ix_{table}_public_id'), table, ['public_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    for table in TABLES:
        op.drop_index(op.f(f'ix_{table}_public_id'), table_name=table)
        op.drop_column(table, 'public_id')
