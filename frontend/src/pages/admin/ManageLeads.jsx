import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { adminApi } from '../../services/api';

export default function ManageLeads() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = () => adminApi.getLeads().then(res => setLeads(res.leads || [])).catch(console.error);
  useEffect(() => { fetchLeads(); }, []);

  const approve = async (id) => {
    await adminApi.approveLead(id);
    fetchLeads();
  };

  const cols = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Actions', cell: row => (
      row.status === 'pending' ? <button onClick={() => approve(row._id || row.id)} className="text-indigo-600">Approve</button> : <span>-</span>
    )}
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Leads</h1>
      <DataTable columns={cols} data={leads} />
    </DashboardLayout>
  );
}