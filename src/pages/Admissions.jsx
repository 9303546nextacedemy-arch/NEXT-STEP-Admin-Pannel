import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, CheckCircle, UserCheck, XCircle, Trash2, 
  Search, RefreshCw, Mail, Phone, MessageCircle 
} from 'lucide-react';
import { admissionService } from '../services/admissionService';

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'contacted', 'enrolled', 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of request being updated

  useEffect(() => {
    // Set up real-time subscription
    setLoading(true);
    const unsubscribe = admissionService.subscribeAdmissionRequests(
      (data) => {
        setAdmissions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to admissions:", error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setActionLoading(requestId);
      await admissionService.updateAdmissionStatus(requestId, newStatus);
    } catch (error) {
      alert("Failed to update status: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this admission request permanently?")) return;
    try {
      setActionLoading(requestId);
      await admissionService.deleteAdmissionRequest(requestId);
    } catch (error) {
      alert("Failed to delete request: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter requests based on status and search query
  const filteredAdmissions = admissions.filter(req => {
    const matchesTab = (req.status || 'pending') === activeTab;
    const matchesSearch = 
      (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count summaries
  const pendingCount = admissions.filter(r => (r.status || 'pending') === 'pending').length;
  const contactedCount = admissions.filter(r => r.status === 'contacted').length;
  const enrolledCount = admissions.filter(r => r.status === 'enrolled').length;
  const cancelledCount = admissions.filter(r => r.status === 'cancelled').length;

  const getStatusTabStyle = (tabName, count, activeColorClass, activeBgClass) => {
    const isActive = activeTab === tabName;
    return `flex-1 py-4 px-4 text-center border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
      isActive 
        ? `${activeColorClass} ${activeBgClass}` 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">Admission Requests</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage and process prospective student applications submitted via the website.</p>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { key: 'pending', label: 'Pending', count: pendingCount, color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
          { key: 'contacted', label: 'Contacted', count: contactedCount, color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Mail },
          { key: 'enrolled', label: 'Enrolled', count: enrolledCount, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: UserCheck },
          { key: 'cancelled', label: 'Cancelled', count: cancelledCount, color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle }
        ].map((stat) => (
          <div 
            key={stat.key}
            onClick={() => setActiveTab(stat.key)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-premium hover:scale-[1.01] ${
              activeTab === stat.key 
                ? 'bg-brand-blue border-brand-blue text-white' 
                : 'bg-white border-slate-100 text-slate-800'
            }`}
          >
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === stat.key ? 'text-white/70' : 'text-slate-400'}`}>{stat.label}</span>
              <span className="text-2xl font-black mt-1.5 block">{stat.count}</span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === stat.key ? 'bg-white/10 text-white' : stat.color
            }`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Listing Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by student name, phone, course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-xs font-semibold" 
            />
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <div 
            onClick={() => setActiveTab('pending')}
            className={getStatusTabStyle('pending', pendingCount, 'border-amber-500 text-amber-600', 'bg-amber-50/20')}
          >
            <Clock size={14} />
            <span>Pending ({pendingCount})</span>
          </div>
          <div 
            onClick={() => setActiveTab('contacted')}
            className={getStatusTabStyle('contacted', contactedCount, 'border-blue-500 text-blue-600', 'bg-blue-50/20')}
          >
            <Mail size={14} />
            <span>Contacted ({contactedCount})</span>
          </div>
          <div 
            onClick={() => setActiveTab('enrolled')}
            className={getStatusTabStyle('enrolled', enrolledCount, 'border-emerald-500 text-emerald-600', 'bg-emerald-50/20')}
          >
            <UserCheck size={14} />
            <span>Enrolled ({enrolledCount})</span>
          </div>
          <div 
            onClick={() => setActiveTab('cancelled')}
            className={getStatusTabStyle('cancelled', cancelledCount, 'border-rose-500 text-rose-600', 'bg-rose-50/20')}
          >
            <XCircle size={14} />
            <span>Cancelled ({cancelledCount})</span>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ClipboardList size={40} className="mx-auto text-slate-200" />
              <p className="font-bold text-sm">No admission requests found.</p>
              <p className="text-xs text-slate-400">Requests with status "{activeTab}" matching your filters will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAdmissions.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-6 rounded-2xl border border-slate-100 flex flex-col justify-between bg-slate-50/50 hover:bg-slate-50 transition-all ${
                    actionLoading === req.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Name Initials & Course */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-brand-blue text-brand-gold font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {(req.name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{req.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            Inquired on: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-brand-blue text-[9px] font-black uppercase tracking-wider shadow-sm">
                        {req.course}
                      </span>
                    </div>

                    {/* Query Message */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600 leading-relaxed min-h-[4rem]">
                      {req.message || <span className="italic text-slate-400">No additional message provided.</span>}
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                      <a 
                        href={`tel:${req.phone}`} 
                        className="flex items-center gap-2 text-slate-600 hover:text-brand-blue bg-white py-2 px-3 rounded-lg border border-slate-100 shadow-sm"
                      >
                        <Phone size={13} className="text-slate-400" />
                        <span>{req.phone}</span>
                      </a>
                      <a 
                        href={`mailto:${req.email}`} 
                        className="flex items-center gap-2 text-slate-600 hover:text-brand-blue bg-white py-2 px-3 rounded-lg border border-slate-100 shadow-sm truncate"
                        title={req.email}
                      >
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{req.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="border-t border-slate-200/70 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Quick Launch WhatsApp button */}
                    {req.phone && (
                      <a 
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(req.name)},%20this%20is%20NEXTSTEP%20Academy%20support%20regarding%20your%20admission%20request%20for%20${encodeURIComponent(req.course)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-extrabold transition-all border border-emerald-100 shadow-sm"
                      >
                        <MessageCircle size={13} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}

                    {/* Moderation Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {req.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'pending')}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold transition-all border border-amber-100"
                        >
                          <Clock size={11} />
                          <span>Pending</span>
                        </button>
                      )}

                      {req.status !== 'contacted' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'contacted')}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition-all border border-blue-100"
                        >
                          <Mail size={11} />
                          <span>Contacted</span>
                        </button>
                      )}

                      {req.status !== 'enrolled' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'enrolled')}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-100"
                        >
                          <CheckCircle size={11} />
                          <span>Enroll</span>
                        </button>
                      )}

                      {req.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50/60 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-all border border-rose-100"
                        >
                          <XCircle size={11} />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Delete Request"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admissions;
