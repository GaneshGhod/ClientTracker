import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { subsApi } from '../../services/api';

export default function Subscription() {
  const subscribe = async (plan) => {
    try {
      await subsApi.create({ plan });
      alert(`Subscribed to ${plan} successfully!`);
    } catch (err) {
      alert('Error subscribing');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
          <h2 className="text-xl font-bold">Basic Plan</h2>
          <p className="text-3xl font-extrabold mt-4">$9.99<span className="text-lg text-gray-500 font-normal">/mo</span></p>
          <ul className="mt-6 space-y-4 text-left">
            <li>✓ 10 claims per month</li>
            <li>✓ Access to basic leads</li>
          </ul>
          <button onClick={() => subscribe('basic')} className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Subscribe</button>
        </div>
        <div className="bg-white rounded-xl border border-indigo-200 p-8 shadow-md text-center ring-2 ring-indigo-600">
          <h2 className="text-xl font-bold text-indigo-600">Pro Plan</h2>
          <p className="text-3xl font-extrabold mt-4">$29.99<span className="text-lg text-gray-500 font-normal">/mo</span></p>
          <ul className="mt-6 space-y-4 text-left">
            <li>✓ Unlimited claims</li>
            <li>✓ Access to premium leads</li>
          </ul>
          <button onClick={() => subscribe('pro')} className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Subscribe</button>
        </div>
      </div>
    </DashboardLayout>
  );
}