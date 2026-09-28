import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

export default function LeadCard({ lead, isSubscribed }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{lead.title}</h3>
        <CategoryBadge name={lead.category?.name || 'Uncategorized'} />
      </div>
      
      <div className={`space-y-3 ${!isSubscribed ? 'blur-sm select-none' : ''}`}>
        <p className="text-sm text-gray-500 line-clamp-2">{lead.description || 'Description hidden...'}</p>
        <div className="text-sm font-medium text-gray-900">Budget: ${lead.budgetMin} - ${lead.budgetMax}</div>
        <div className="text-xs text-gray-400">Posted: {new Date(lead.createdAt || Date.now()).toLocaleDateString()}</div>
      </div>

      {!isSubscribed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60">
          <Lock className="h-8 w-8 text-gray-500 mb-2" />
          <Link to="/freelancer/subscription" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Subscribe to view
          </Link>
        </div>
      )}

      {isSubscribed && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to={`/freelancer/leads/${lead._id || lead.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View Details &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}