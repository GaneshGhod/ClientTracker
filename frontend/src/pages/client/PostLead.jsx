import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LeadForm from '../../components/forms/LeadForm';
import { clientApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PostLead() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await clientApi.createLead(data);
      navigate('/client/my-leads');
    } catch (err) {
      alert('Error creating lead');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Lead</h1>
      <div className="max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <LeadForm onSubmit={handleSubmit} />
      </div>
    </DashboardLayout>
  );
}