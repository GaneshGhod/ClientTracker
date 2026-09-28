import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadCard from '../../components/shared/LeadCard';
import { leadsApi, subsApi } from '../../services/api';

export default function BrowseLeads() {
  const [leads, setLeads] = useState([]);
  const [subActive, setSubActive] = useState(false);

  useEffect(() => {
    subsApi.getStatus().then(res => setSubActive(res.status === 'active' || res.subscription?.status === 'active')).catch(() => setSubActive(false));
    leadsApi.getAll({ limit: 50 }).then(res => setLeads(res.leads || [])).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Leads</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => <LeadCard key={lead._id || lead.id} lead={lead} isSubscribed={subActive} />)}
      </div>
    </DashboardLayout>
  );
}