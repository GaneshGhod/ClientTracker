import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, List, Search, CreditCard, Users, Briefcase, FileText, PlusCircle } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const links = {
    freelancer: [
      { name: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard },
      { name: 'Browse Leads', path: '/freelancer/leads', icon: Search },
      { name: 'My Leads', path: '/freelancer/my-leads', icon: Briefcase },
      { name: 'Subscription', path: '/freelancer/subscription', icon: CreditCard },
    ],
    client: [
      { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
      { name: 'Post Lead', path: '/client/post-lead', icon: PlusCircle },
      { name: 'My Leads', path: '/client/my-leads', icon: List },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Leads', path: '/admin/leads', icon: FileText },
      { name: 'Categories', path: '/admin/categories', icon: List },
      { name: 'Freelancers', path: '/admin/freelancers', icon: Users },
      { name: 'Clients', path: '/admin/clients', icon: Users },
    ],
  };

  const navLinks = links[role] || [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen pt-16 fixed">
      <div className="flex flex-col mt-5 h-full">
        <nav className="flex-1 px-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}