import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ClientSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/client/dashboard');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Client Signup</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="text" placeholder="Company Name" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email address" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 sm:text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Sign up</button>
        </form>
      </div>
    </div>
  );
}