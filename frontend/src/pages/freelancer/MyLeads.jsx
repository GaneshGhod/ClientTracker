import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { leadsApi } from '../../services/api';

export default function MyLeads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    leadsApi.getMyLeads().then(res => setLeads(res.leads || [])).catch(console.error);
  }, []);

  const cols = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Budget', cell: row => `$${row.budgetMin} - $${row.budgetMax}` },
    { header: 'Contact', accessorKey: 'clientContact' }
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Claimed Leads</h1>
      <DataTable columns={cols} data={leads} />
    </DashboardLayout>
  );
}