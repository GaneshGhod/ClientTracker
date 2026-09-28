import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { clientTrackerApi } from '../services/api';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  X,
  Bell,
  ChevronDown,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'New Lead', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  contacted: { label: 'Contacted', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  in_discussion: { label: 'In Discussion', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  lost: { label: 'Lost / Closed', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function ClientTracker() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [remindersOnly, setRemindersOnly] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    projectTitle: '',
    projectDescription: '',
    budget: '',
    status: 'new',
    followUpDate: '',
    followUpNote: '',
    notes: '',
  });

  // Reminder quick modal form
  const [quickReminderDate, setQuickReminderDate] = useState('');
  const [quickReminderNote, setQuickReminderNote] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (remindersOnly) params.remindersOnly = 'true';

      const data = await clientTrackerApi.getAll(params);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, remindersOnly]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Reminder stats calculation
  const reminderStats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let overdueCount = 0;
    let dueTodayCount = 0;

    clients.forEach((c) => {
      if (!c.followUpDate || ['completed', 'lost'].includes(c.status)) return;
      const fDate = new Date(c.followUpDate);
      if (fDate < startOfToday) {
        overdueCount++;
      } else if (fDate <= endOfToday) {
        dueTodayCount++;
      }
    });

    return {
      overdueCount,
      dueTodayCount,
      totalDue: overdueCount + dueTodayCount,
    };
  }, [clients]);

  // Overall metric stats
  const metrics = useMemo(() => {
    const total = clients.length;
    const inProgress = clients.filter((c) => c.status === 'in_progress' || c.status === 'in_discussion').length;
    const completed = clients.filter((c) => c.status === 'completed').length;
    return { total, inProgress, completed };
  }, [clients]);

  // Handle open Add Modal
  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      projectTitle: '',
      projectDescription: '',
      budget: '',
      status: 'new',
      followUpDate: '',
      followUpNote: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (client) => {
    setEditingClient(client);
    let dateStr = '';
    if (client.followUpDate) {
      const d = new Date(client.followUpDate);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      dateStr = d.toISOString().slice(0, 16);
    }

    setFormData({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      projectTitle: client.projectTitle || '',
      projectDescription: client.projectDescription || '',
      budget: client.budget || '',
      status: client.status || 'new',
      followUpDate: dateStr,
      followUpNote: client.followUpNote || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  // Save Client (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientTrackerApi.update(editingClient.id, formData);
      } else {
        await clientTrackerApi.create(formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save client');
    }
  };

  // Quick 1-click status change
  const handleQuickStatusChange = async (clientId, newStatus) => {
    try {
      // Optimistic update
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
      );
      await clientTrackerApi.updateStatus(clientId, newStatus);
    } catch (err) {
      console.error('Error changing status:', err);
      fetchClients();
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Are you sure you want to delete ${clientName}?`)) return;
    try {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      await clientTrackerApi.delete(clientId);
    } catch (err) {
      alert('Failed to delete client');
      fetchClients();
    }
  };

  // Open Quick Reminder Modal
  const handleOpenReminderModal = (client) => {
    setReminderTarget(client);
    let dateStr = '';
    if (client.followUpDate) {
      const d = new Date(client.followUpDate);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      dateStr = d.toISOString().slice(0, 16);
    }
    setQuickReminderDate(dateStr);
    setQuickReminderNote(client.followUpNote || '');
    setIsReminderModalOpen(true);
  };

  // Save quick reminder
  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!reminderTarget) return;
    try {
      await clientTrackerApi.update(reminderTarget.id, {
        followUpDate: quickReminderDate || null,
        followUpNote: quickReminderNote,
      });
      setIsReminderModalOpen(false);
      fetchClients();
    } catch (err) {
      alert('Failed to set reminder');
    }
  };

  // Helper to format follow-up badge
  const renderFollowUpBadge = (client) => {
    if (!client.followUpDate) {
      return (
        <button
          onClick={() => handleOpenReminderModal(client)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-dashed border-gray-300 hover:border-indigo-300 rounded-md px-2.5 py-1 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Set Reminder</span>
        </button>
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const fDate = new Date(client.followUpDate);
    const isCompleted = ['completed', 'lost'].includes(client.status);

    let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
    let label = fDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    let icon = <Clock className="w-3.5 h-3.5 text-blue-600" />;

    if (!isCompleted) {
      if (fDate < startOfToday) {
        badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        label = `Overdue: ${fDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      } else if (fDate <= endOfToday) {
        badgeClass = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
        label = `Due Today (${fDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        icon = <Bell className="w-3.5 h-3.5 text-amber-600" />;
      }
    }

    return (
      <div className="flex flex-col gap-1 items-start">
        <button
          onClick={() => handleOpenReminderModal(client)}
          title="Click to update reminder"
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium cursor-pointer hover:opacity-85 ${badgeClass}`}
        >
          {icon}
          <span>{label}</span>
        </button>
        {client.followUpNote && (
          <span className="text-[11px] text-gray-500 line-clamp-1 italic max-w-[200px]" title={client.followUpNote}>
            "{client.followUpNote}"
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Client & Follow-Up Tracker</h1>
              <p className="text-xs text-slate-500">Track client status, project deals, and scheduled follow-ups</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClients}
              title="Refresh"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Urgent Follow-Up Alert Banner */}
        {reminderStats.totalDue > 0 && !remindersOnly && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-950">
                  {reminderStats.totalDue} Client Follow-Up{reminderStats.totalDue > 1 ? 's' : ''} Need Action Today
                </p>
                <p className="text-xs text-amber-800">
                  {reminderStats.overdueCount > 0 && (
                    <span className="font-semibold text-rose-600 mr-2">
                      ⚠️ {reminderStats.overdueCount} Overdue
                    </span>
                  )}
                  {reminderStats.dueTodayCount > 0 && (
                    <span>📅 {reminderStats.dueTodayCount} Scheduled for today</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRemindersOnly(true)}
              className="inline-flex items-center justify-center text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            >
              Filter Due Clients Only
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</p>
            </div>
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setRemindersOnly((prev) => !prev)}
            className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
              remindersOnly
                ? 'bg-amber-100/60 border-amber-400 ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wider">Follow-Ups Due</p>
              <p className="text-2xl font-bold text-amber-900 mt-1 flex items-center gap-2">
                {reminderStats.totalDue}
                {reminderStats.overdueCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {reminderStats.overdueCount} overdue
                  </span>
                )}
              </p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Deals</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{metrics.inProgress}</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed / Won</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.completed}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, company, email..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reminders Toggle Button */}
            <button
              onClick={() => setRemindersOnly((prev) => !prev)}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all ${
                remindersOnly
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{remindersOnly ? 'Showing Due Reminders' : 'Filter by Reminders Due'}</span>
              {reminderStats.totalDue > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${remindersOnly ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'}`}>
                  {reminderStats.totalDue}
                </span>
              )}
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Clients ({clients.length})
            </button>

            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Table / Cards */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-sm text-slate-500">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-xs">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No clients found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {search || selectedStatus !== 'all' || remindersOnly
                ? 'Try adjusting your search terms or filters.'
                : 'Get started by recording your first client inquiry or deal.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3.5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Client
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left">Client & Contact</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Project & Budget</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Follow-Up Reminder</th>
                    <th scope="col" className="px-5 py-3.5 text-left">Notes</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {clients.map((client) => {
                    const statusObj = STATUS_CONFIG[client.status] || STATUS_CONFIG.new;

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Client & Contact */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{client.name}</div>
                          {client.company && (
                            <div className="text-xs text-slate-500 font-medium">{client.company}</div>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            {client.email && (
                              <a
                                href={`mailto:${client.email}`}
                                className="inline-flex items-center gap-1 hover:text-indigo-600"
                                title={client.email}
                              >
                                <Mail className="w-3 h-3" />
                                <span className="max-w-[130px] truncate">{client.email}</span>
                              </a>
                            )}
                            {client.phone && (
                              <a
                                href={`tel:${client.phone}`}
                                className="inline-flex items-center gap-1 hover:text-indigo-600"
                                title={client.phone}
                              >
                                <Phone className="w-3 h-3" />
                                <span>{client.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Project & Budget */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 max-w-[220px] truncate" title={client.projectTitle}>
                            {client.projectTitle || <span className="text-slate-400 italic">No title</span>}
                          </div>
                          {client.budget && (
                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                              <DollarSign className="w-3 h-3 -mr-0.5" />
                              <span>{client.budget}</span>
                            </div>
                          )}
                          {client.projectDescription && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 max-w-[220px]" title={client.projectDescription}>
                              {client.projectDescription}
                            </p>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={client.status}
                              onChange={(e) => handleQuickStatusChange(client.id, e.target.value)}
                              className={`appearance-none text-xs font-semibold rounded-lg px-2.5 py-1.5 pr-6 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusObj.bg} ${statusObj.text} ${statusObj.border}`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
                                <option key={val} value={val} className="bg-white text-slate-900">
                                  {conf.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        </td>

                        {/* Follow-Up Reminder */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {renderFollowUpBadge(client)}
                        </td>

                        {/* Notes Snippet */}
                        <td className="px-5 py-4">
                          {client.notes ? (
                            <div
                              onClick={() => handleOpenEdit(client)}
                              className="text-xs text-slate-600 line-clamp-2 max-w-[200px] cursor-pointer hover:text-slate-900"
                              title={client.notes}
                            >
                              {client.notes}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">None</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenReminderModal(client)}
                              title="Set Reminder"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(client)}
                              title="Edit Client"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id, client.name)}
                              title="Delete Client"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingClient ? 'Edit Client Details' : 'Add New Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Digital"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title / Service</label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g. Website Redesign"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget / Quote</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. $3,500"
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Follow-Up Section */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>⏰ Follow-Up Reminder</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Reminder Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Reminder Action / Note</label>
                    <input
                      type="text"
                      value={formData.followUpNote}
                      onChange={(e) => setFormData({ ...formData, followUpNote: e.target.value })}
                      placeholder="e.g. Call to discuss contract"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">General Notes & History</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record conversation details, next steps, client preferences..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK REMINDER MODAL */}
      {isReminderModalOpen && reminderTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Set Follow-Up Reminder</span>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Scheduling follow-up for <span className="font-semibold text-slate-800">{reminderTarget.name}</span>
            </p>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-Up Date & Time</label>
                <input
                  type="datetime-local"
                  value={quickReminderDate}
                  onChange={(e) => setQuickReminderDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">What to follow up on?</label>
                <input
                  type="text"
                  value={quickReminderNote}
                  onChange={(e) => setQuickReminderNote(e.target.value)}
                  placeholder="e.g. Call to finalize quote"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {reminderTarget.followUpDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickReminderDate('');
                      setQuickReminderNote('');
                    }}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear Reminder
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsReminderModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                  >
                    Save Reminder
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
