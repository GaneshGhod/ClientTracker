import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([]);
  useEffect(() => { adminApi.getFreelancers().then(res => setFreelancers(res.freelancers || [])).catch(console.error); }, []);
  const cols = [{ header: 'Name', accessorKey: 'name' }, { header: 'Email', accessorKey: 'email' }];
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Freelancers</h1>
      <DataTable columns={cols} data={freelancers} />
    </DashboardLayout>
  );
}