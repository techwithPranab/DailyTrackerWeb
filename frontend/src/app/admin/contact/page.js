'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import adminApi from '@/lib/adminApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Detail / Edit Modal ────────────────────────────────────────────────────────
function MessageModal({ message, onClose, onSave }) {
  const [status,    setStatus]    = useState(message.status);
  const [adminNote, setAdminNote] = useState(message.adminNote || '');
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await adminApi.put(`/admin/contact/${message._id}`, { status, adminNote });
      toast.success('Message updated');
      onSave(data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg truncate pr-4">{message.subject}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sender info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">From</p>
              <p className="font-medium text-gray-900">{message.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <a href={`mailto:${message.email}`} className="font-medium text-blue-600 hover:underline">{message.email}</a>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Received</p>
              <p className="font-medium text-gray-700">{format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
            <div className="ml-auto">
              <p className="text-xs text-gray-400 mb-0.5">Current Status</p>
              <StatusBadge status={message.status} />
            </div>
          </div>

          {/* Message body */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Message</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{message.message}</p>
          </div>

          {/* Reply shortcut */}
          <div>
            <a
              href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              ✉️ Reply via Email
            </a>
          </div>

          {/* Status update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Update Status</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    status === key
                      ? `${cfg.color} border-transparent ring-2 ring-offset-1 ring-current`
                      : 'border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Note (internal)</label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Add an internal note about this message…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminContactPage() {
  const [messages,   setMessages]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [counts,     setCounts]     = useState({ new: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading,    setLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState(null); // message open in modal
  const [deleting,     setDeleting]     = useState(null); // id being deleted

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (search)       params.set('search', search);
      const { data } = await adminApi.get(`/admin/contact?${params}`);
      setMessages(data.data);
      setPagination(data.pagination);
      setCounts(data.counts ?? {});
    } catch {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleMessageSaved = (updated) => {
    setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    // Update counts optimistically
    fetchMessages();
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this message?')) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/admin/contact/${id}`);
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m._id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // Quick inline status change without opening modal
  const handleQuickStatus = async (id, newStatus) => {
    try {
      const { data } = await adminApi.put(`/admin/contact/${id}`, { status: newStatus });
      setMessages(prev => prev.map(m => m._id === id ? data.data : m));
      fetchMessages(); // refresh counts
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setSelected(null)}
          onSave={handleMessageSaved}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Contact Messages</h2>
            <p className="text-gray-500 text-sm mt-1">{pagination.total} total messages received</p>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'new',         label: 'New',         icon: '🔵', color: 'border-blue-200 bg-blue-50',    val: counts.new         },
            { key: 'in_progress', label: 'In Progress', icon: '🟡', color: 'border-yellow-200 bg-yellow-50', val: counts.in_progress },
            { key: 'resolved',    label: 'Resolved',    icon: '🟢', color: 'border-green-200 bg-green-50',  val: counts.resolved    },
            { key: 'closed',      label: 'Closed',      icon: '⚪', color: 'border-gray-200 bg-gray-50',    val: counts.closed      },
          ].map(c => (
            <button
              key={c.key}
              onClick={() => { setStatusFilter(statusFilter === c.key ? '' : c.key); setPage(1); }}
              className={`rounded-xl border p-4 text-left transition-all ${c.color} ${statusFilter === c.key ? 'ring-2 ring-offset-1 ring-indigo-400' : 'hover:shadow-sm'}`}
            >
              <div className="text-xl mb-1">{c.icon}</div>
              <p className="text-2xl font-extrabold text-gray-900">{c.val ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </button>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder="Search by name, email or subject…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              Search
            </button>
            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); setPage(1); }}
                className="px-3 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Messages table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-medium">No messages found</p>
              <p className="text-sm mt-1">Try clearing your filters</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Sender', 'Subject', 'Received', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {messages.map(msg => (
                      <tr key={msg._id} className={`hover:bg-gray-50 transition-colors ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 text-sm">{msg.name}</p>
                          <p className="text-gray-400 text-xs">{msg.email}</p>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-gray-800 truncate">{msg.subject}</p>
                          <p className="text-gray-400 text-xs truncate mt-0.5">{msg.message}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                          <br />
                          <span className="text-gray-400">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={msg.status}
                            onChange={e => handleQuickStatus(msg._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, c]) => (
                              <option key={k} value={k}>{c.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelected(msg)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                            >
                              View
                            </button>
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                            >
                              Reply
                            </a>
                            <button
                              onClick={() => handleDelete(msg._id)}
                              disabled={deleting === msg._id}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deleting === msg._id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {messages.map(msg => (
                  <div key={msg._id} className={`p-4 ${msg.status === 'new' ? 'bg-blue-50/40' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{msg.name}</p>
                        <p className="text-gray-400 text-xs">{msg.email}</p>
                      </div>
                      <StatusBadge status={msg.status} />
                    </div>
                    <p className="font-medium text-gray-800 text-sm mb-1 truncate">{msg.subject}</p>
                    <p className="text-gray-400 text-xs truncate mb-3">{msg.message}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{format(new Date(msg.createdAt), 'MMM d, yyyy')}</span>
                      <span className="ml-auto flex gap-2">
                        <button
                          onClick={() => setSelected(msg)}
                          className="font-semibold text-indigo-600 hover:underline"
                        >View</button>
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="font-semibold text-purple-600 hover:underline"
                        >Reply</a>
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="font-semibold text-red-500 hover:underline"
                        >Delete</button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.pages} · {pagination.total} messages
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >← Prev</button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
