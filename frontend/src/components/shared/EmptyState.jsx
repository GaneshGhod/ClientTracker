import React from 'react';

export default function EmptyState({ title, description }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}