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

  // Live Config States
  const [jitsiSettings, setJitsiSettings] = useState({ domain: 'meet.jit.si', appId: '', secret: '' });
  const [youtubeSettings, setYoutubeSettings] = useState({ clientId: '', clientSecret: '', gmail: '', refreshToken: '' });

  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const emails = await adminSettingsService.getAuthorizedEmails();
      const settings = await adminSettingsService.getAppSettings();
      const jitsi = await adminSettingsService.getJitsiSettings();
      const yt = await adminSettingsService.getYoutubeSettings();
      setAuthorizedEmails(emails);
      setAppSettings(settings);
      setJitsiSettings(jitsi);
      setYoutubeSettings(yt);
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

  const handleSaveJitsi = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminSettingsService.updateJitsiSettings(jitsiSettings);
      showToast('Jitsi settings saved successfully');
    } catch (error) {
      showToast('Failed to save Jitsi: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveYoutubeCredentials = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminSettingsService.updateYoutubeSettings(youtubeSettings);
      showToast('YouTube credentials saved');
    } catch (error) {
      showToast('Failed to save credentials: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectYoutube = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://asia-south1-next-step-academy-5b9ab.cloudfunctions.net/youtubeAuthUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank', 'width=600,height=600');
        showToast('OAuth flow started. Connect your account in the popup.');
        
        // Listen for Firestore updates to know when connection finishes
        const checkInterval = setInterval(async () => {
          const yt = await adminSettingsService.getYoutubeSettings();
          if (yt.refreshToken) {
            setYoutubeSettings(yt);
            showToast('YouTube channel successfully connected!');
            clearInterval(checkInterval);
          }
        }, 3000);
        setTimeout(() => clearInterval(checkInterval), 60000);
      } else {
        showToast('Failed to get authorization URL: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast('Failed to connect YouTube: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
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
    { id: 'liveConfig', name: 'Live & Jitsi Settings', icon: Settings2 },
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

          {/* Live & Jitsi Configuration Section */}
          {activeTab === 'liveConfig' && (
            <div className="space-y-6">
              {/* Jitsi Meet Settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">Jitsi Meet Server Settings</h2>
                  <p className="text-sm text-gray-500">Configure your Jitsi video server details. Defaults to free public instance.</p>
                </div>
                <form onSubmit={handleSaveJitsi} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jitsi Domain</label>
                    <input 
                      type="text" 
                      required
                      value={jitsiSettings.domain}
                      onChange={(e) => setJitsiSettings({...jitsiSettings, domain: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="meet.jit.si or your-jitsi-subdomain.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">App ID (JWT Iss)</label>
                      <input 
                        type="text" 
                        value={jitsiSettings.appId || ''}
                        onChange={(e) => setJitsiSettings({...jitsiSettings, appId: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                        placeholder="my-jitsi-app"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">App Secret (JWT Secret)</label>
                      <input 
                        type="password" 
                        value={jitsiSettings.secret || ''}
                        onChange={(e) => setJitsiSettings({...jitsiSettings, secret: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 disabled:opacity-50"
                    >
                      Save Jitsi Settings
                    </button>
                  </div>
                </form>
              </div>

              {/* YouTube Credentials Settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">YouTube API Credentials</h2>
                  <p className="text-sm text-gray-500">Add credentials from Google Cloud Console to enable YouTube Live Streaming.</p>
                </div>
                <form onSubmit={handleSaveYoutubeCredentials} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client ID</label>
                    <input 
                      type="text" 
                      required
                      value={youtubeSettings.clientId || ''}
                      onChange={(e) => setYoutubeSettings({...youtubeSettings, clientId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" 
                      placeholder="Google OAuth Client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Secret</label>
                    <input 
                      type="password" 
                      required
                      value={youtubeSettings.clientSecret || ''}
                      onChange={(e) => setYoutubeSettings({...youtubeSettings, clientSecret: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" 
                      placeholder="Google OAuth Client Secret"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gmail for Streaming</label>
                      <input 
                        type="email" 
                        required
                        value={youtubeSettings.gmail || ''}
                        onChange={(e) => setYoutubeSettings({...youtubeSettings, gmail: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                        placeholder="97487787lecnextstepyt@gmail.com"
                      />
                    </div>
                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* YouTube Integration Connection Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">YouTube Live Broadcaster Connection</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Connect your YouTube Channel to auto-stream and auto-record classrooms.</p>
                  
                  {youtubeSettings.refreshToken ? (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span>Connected: {youtubeSettings.gmail || 'Channel'}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Not Authorized Yet</span>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={handleConnectYoutube}
                    disabled={loading || !youtubeSettings.clientId || !youtubeSettings.clientSecret}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {youtubeSettings.refreshToken ? 'Reconnect Channel' : 'Connect Channel'}
                  </button>
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
