import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import { adminApi } from '../../services/api';
import { Users, FileText, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Leads" value={stats.totalLeads || 0} icon={<FileText className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Freelancers" value={stats.totalFreelancers || 0} icon={<Users className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Clients" value={stats.totalClients || 0} icon={<Briefcase className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}