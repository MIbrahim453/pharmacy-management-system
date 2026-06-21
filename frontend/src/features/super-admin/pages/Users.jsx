import { useState } from 'react';
import { toast } from 'sonner';
import { Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/common/PageHeader';
import SearchBar from '../../../components/common/SearchBar';
import { Card } from '../../../components/ui/Card';
import { Table, Th, Td, TableEmpty } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import Pagination from '../../../components/ui/Pagination';
import { initials } from '../../../utils/helpers';

// TODO: Replace with API call — GET /api/super-admin/users
const USERS = [
  { name: 'Ahmed Raza', email: 'ahmed@medpoint.pk', role: 'Admin', pharmacy: 'MedPoint Karachi', last: '2 hrs ago', status: 'Active' },
  { name: 'Sara Khan', email: 'sara@lifecare.pk', role: 'Admin', pharmacy: 'LifeCare Lahore', last: '1 day ago', status: 'Active' },
  { name: 'Usman Ali', email: 'usman@pharmaplus.pk', role: 'Admin', pharmacy: 'PharmaPlus ISB', last: '3 hrs ago', status: 'Active' },
  { name: 'Fatima Sheikh', email: 'fatima@medpoint.pk', role: 'Staff', pharmacy: 'MedPoint Karachi', last: '30 min ago', status: 'Active' },
  { name: 'Bilal Hassan', email: 'bilal@medpoint.pk', role: 'Staff', pharmacy: 'MedPoint Karachi', last: '5 hrs ago', status: 'Active' },
  { name: 'System Admin', email: 'super@pharmasys.pk', role: 'Super Admin', pharmacy: 'Platform', last: '10 min ago', status: 'Active' },
  { name: 'Nadia Ahmed', email: 'nadia@lifecare.pk', role: 'Staff', pharmacy: 'LifeCare Lahore', last: '2 days ago', status: 'Active' },
];

const PER_PAGE = 8;
const ROLE_FILTERS = ['All', 'Super Admin', 'Admin', 'Staff'];

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = USERS.filter((u) =>
    (roleF === 'All' || u.role === roleF) &&
    (u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.pharmacy.toLowerCase().includes(query.toLowerCase())),
  );
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${USERS.length} accounts across all pharmacies`}
      />

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-outline-variant/60">
          <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search users…" className="w-full sm:flex-1 sm:max-w-xs" />
          <Select
            value={roleF}
            onChange={(e) => { setRoleF(e.target.value); setPage(1); }}
            options={ROLE_FILTERS}
            className="w-full sm:w-36 h-9 text-sm"
          />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>User</Th><Th>Role</Th><Th>Pharmacy</Th>
              <Th>Last active</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <TableEmpty cols={6} message="No users found" icon={<UsersIcon size={32} />} />
            ) : paginated.map((u, i) => (
              <motion.tr key={u.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-bold">
                      {initials(u.name)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{u.name}</div>
                      <div className="text-xs text-on-surface-variant">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge variant={u.role === 'Super Admin' ? 'danger' : u.role === 'Admin' ? 'primary' : 'default'}>
                    {u.role}
                  </Badge>
                </Td>
                <Td className="text-sm text-on-surface-variant">{u.pharmacy}</Td>
                <Td className="text-xs text-on-surface-variant">{u.last}</Td>
                <Td><Badge status={u.status} dot /></Td>
                <Td>
                  <button onClick={() => toast.info(`Viewing ${u.name}`)} className="btn-ghost px-2 py-1 text-xs rounded-lg">
                    View
                  </button>
                </Td>
              </motion.tr>
            ))}
          </tbody>
        </Table>

        <div className="px-5 py-4 border-t border-outline-variant/60">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>
    </>
  );
}
