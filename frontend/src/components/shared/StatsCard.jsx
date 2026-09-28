import React from 'react';

export default function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 flex items-center">
        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}