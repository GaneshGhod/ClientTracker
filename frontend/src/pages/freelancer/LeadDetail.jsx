import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { leadsApi, subsApi } from '../../services/api';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [subActive, setSubActive] = useState(false);

  useEffect(() => {
    subsApi.getStatus().then(res => setSubActive(res.status === 'active' || res.subscription?.status === 'active')).catch(() => setSubActive(false));
    leadsApi.getOne(id).then(res => setLead(res.lead)).catch(console.error);
  }, [id]);

  const claimLead = async () => {
    try {
      await leadsApi.claim(id);
      alert('Lead claimed successfully!');
    } catch (err) {
      alert('Error claiming lead');
    }
  };

  if (!lead) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{lead.title}</h1>
        <div className={`space-y-4 ${!subActive ? 'blur-sm select-none' : ''}`}>
          <p className="text-gray-700">{lead.description}</p>
          <p className="font-semibold">Budget: ${lead.budgetMin} - ${lead.budgetMax}</p>
          <p>Contact: {lead.clientContact}</p>
        </div>
        <div className="mt-8">
          <button disabled={!subActive} onClick={claimLead} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            Claim Lead
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}