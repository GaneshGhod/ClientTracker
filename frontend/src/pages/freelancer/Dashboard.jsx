import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/shared/StatsCard';
import SubscriptionBanner from '../../components/shared/SubscriptionBanner';
import { Briefcase, CreditCard } from 'lucide-react';
import { subsApi, leadsApi } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ claimed: 0, subActive: false });

  useEffect(() => {
    Promise.all([
      leadsApi.getMyLeads(),
      subsApi.getStatus().catch(() => ({ status: 'inactive' }))
    ]).then(([leadsData, subData]) => {
      setStats({
        claimed: leadsData.leads?.length || 0,
        subActive: subData.subscription?.status === 'active' || subData.status === 'active' || false
      });
    }).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      {!stats.subActive && <SubscriptionBanner />}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Claimed Leads" value={stats.claimed} icon={<Briefcase className="h-6 w-6 text-indigo-600" />} />
        <StatsCard title="Subscription Status" value={stats.subActive ? 'Active' : 'Inactive'} icon={<CreditCard className="h-6 w-6 text-indigo-600" />} />
      </div>
    </DashboardLayout>
  );
}