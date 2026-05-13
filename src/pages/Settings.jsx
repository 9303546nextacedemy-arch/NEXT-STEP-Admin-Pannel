import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Settings2, Loader2, Plus, Trash2, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { adminSettingsService } from '../services/adminSettingsService';
import { SUPER_ADMIN_EMAILS } from '../config/adminAuth';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Tab States
  const [authorizedEmails, setAuthorizedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [appSettings, setAppSettings] = useState({ maintenanceMode: false, demoMode: true });

  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const emails = await adminSettingsService.getAuthorizedEmails();
      const settings = await adminSettingsService.getAppSettings();
      setAuthorizedEmails(emails);
      setAppSettings(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    if (!newEmail.includes('@')) {
      showToast('Invalid email address', 'error');
      return;
    }
    const lower = newEmail.trim().toLowerCase();
    if (authorizedEmails.includes(lower) || SUPER_ADMIN_EMAILS.includes(lower)) {
      showToast('Email already authorized', 'error');
      return;
    }

    const updated = [...authorizedEmails, lower];
    try {
      setLoading(true);
      await adminSettingsService.updateAuthorizedEmails(updated);
      setAuthorizedEmails(updated);
      setNewEmail('');
      showToast('Admin access granted');
    } catch (error) {
      showToast('Failed to update: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmail = async (email) => {
    if (!window.confirm(`Revoke access for ${email}?`)) return;
    const updated = authorizedEmails.filter(e => e !== email);
    try {
      setLoading(true);
      await adminSettingsService.updateAuthorizedEmails(updated);
      setAuthorizedEmails(updated);
      showToast('Access revoked');
    } catch (error) {
      showToast('Failed to update: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppConfig = async (key, value) => {
    const updated = { ...appSettings, [key]: value };
    try {
      setLoading(true);
      await adminSettingsService.updateAppSettings(updated);
      setAppSettings(updated);
      showToast('Settings updated');
    } catch (error) {
      showToast('Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: User },
    { id: 'access', name: 'Admin Access', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your administrator account and global application configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                    activeTab === tab.id 
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toast Message */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}

          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
                  <p className="text-sm text-gray-500">Your account is managed via Google Authentication.</p>
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue/20 bg-gray-50">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-blue"><User size={32} /></div>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 font-medium">
                      {currentUser?.displayName || 'Admin User'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 font-medium">
                      {currentUser?.email}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                  <ShieldCheck className="text-brand-blue shrink-0" size={24} />
                  <div className="text-sm">
                    <p className="font-bold text-brand-blue">Google Managed Account</p>
                    <p className="text-brand-blue/80">Security settings and password management are handled by Google. You cannot change your password here.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Access Section */}
          {activeTab === 'access' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-900">Manage Admin Access</h2>
                <p className="text-sm text-gray-500">Control which Gmail accounts can access this admin panel.</p>
              </div>
              <div className="p-6 space-y-6">
                <form onSubmit={handleAddEmail} className="flex gap-3">
                  <input 
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter Gmail address"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue transition-all"
                  />
                  <button 
                    disabled={loading}
                    className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    <span>Grant Access</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Authorized Administrators</label>
                  <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                    {/* Super Admins (Static) */}
                    {SUPER_ADMIN_EMAILS.map(email => (
                      <div key={email} className="p-4 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue"><ShieldCheck size={16} /></div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{email}</p>
                            <span className="text-[10px] font-bold text-brand-blue uppercase bg-brand-blue/10 px-2 py-0.5 rounded-full">Super Admin</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Dynamic Admins */}
                    {authorizedEmails.map(email => (
                      <div key={email} className="p-4 bg-white flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={16} /></div>
                          <p className="font-bold text-gray-700 text-sm">{email}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveEmail(email)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {authorizedEmails.length === 0 && (
                      <div className="p-8 text-center text-gray-400 italic text-sm">No additional admins added.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Footer / Danger Zone */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-premium p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><LogOut size={24} /></div>
              <div>
                <p className="font-bold text-gray-900">Logout</p>
                <p className="text-xs text-gray-500">Sign out of the admin panel sessions.</p>
              </div>
            </div>
            <button 
              onClick={() => { if(window.confirm("Are you sure you want to logout?")) auth.signOut(); }}
              className="px-6 py-2.5 border border-rose-100 text-rose-500 font-bold rounded-xl hover:bg-rose-50 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
