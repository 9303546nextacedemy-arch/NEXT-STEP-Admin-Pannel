import React from 'react';
import { Lock, Shield, User, Smartphone } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account credentials and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-blue text-white rounded-xl shadow-md transition-all font-bold">
            <Lock size={18} />
            <span>Security & Password</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-semibold">
            <User size={18} />
            <span>Profile Information</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-semibold">
            <Smartphone size={18} />
            <span>App Preferences</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-semibold">
            <Shield size={18} />
            <span>Access Control</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Change Admin Password</h2>
              <p className="text-sm text-gray-500 mt-1">Ensure your account uses a strong, unique password.</p>
            </div>
            <form className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-mono" />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-mono" />
                <p className="text-xs text-gray-500 mt-2">Password must be at least 8 characters long and include numbers and symbols.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-mono" />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="button" className="px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20">
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
            <h3 className="text-rose-800 font-bold mb-2">Danger Zone</h3>
            <p className="text-sm text-rose-600 mb-4">Actions here are permanent and cannot be undone.</p>
            <button className="px-4 py-2 bg-white text-rose-600 border border-rose-200 font-bold rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm">
              Force Logout All Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
