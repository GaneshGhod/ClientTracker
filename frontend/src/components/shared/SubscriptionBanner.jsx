import React from 'react';
import { Link } from 'react-router-dom';

export default function SubscriptionBanner() {
  return (
    <div className="bg-indigo-600 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-white">
          <p className="text-sm font-medium">Upgrade now to access leads</p>
        </div>
        <Link to="/freelancer/subscription" className="bg-white px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-gray-50">
          View Plans
        </Link>
      </div>
    </div>
  );
}