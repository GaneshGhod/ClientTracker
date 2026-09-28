import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  useEffect(() => { adminApi.getClients().then(res => setClients(res.clients || [])).catch(console.error); }, []);
  const cols = [{ header: 'Name', accessorKey: 'name' }, { header: 'Email', accessorKey: 'email' }];
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clients</h1>
      <DataTable columns={cols} data={clients} />
    </DashboardLayout>
  );
}