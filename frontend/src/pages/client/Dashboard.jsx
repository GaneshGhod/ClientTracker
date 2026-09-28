import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import { List } from 'lucide-react';
import { clientApi } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    clientApi.getMyLeads().then(res => setStats({ total: res.leads?.length || 0 })).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Client Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="My Posted Leads" value={stats.total} icon={<List className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}