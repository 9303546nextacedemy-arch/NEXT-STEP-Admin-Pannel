import React, { useEffect, useState } from 'react';
import { Send, Bell, Info, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { courseService } from '../services/courseService';

const Notifications = () => {
  const [notificationType, setNotificationType] = useState('info');
  const [targetGroup, setTargetGroup] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [deepLinkMode, setDeepLinkMode] = useState('notifications');
  const [deepLinkCustom, setDeepLinkCustom] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadData();
    loadHistory();
  }, []);

  const loadData = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await notificationService.getAllNotifications();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification? It will be removed from all student apps.')) return;
    try {
      await notificationService.deleteNotification(id);
      setHistory(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete notification');
    }
  };

  const resolveDeepLink = () => {
    if (deepLinkMode === 'custom') {
      const c = deepLinkCustom.trim();
      if (!c) return '/notifications';
      return c.startsWith('/') ? c : `/${c}`;
    }
    const map = { notifications: '/notifications', home: '/home', courses: '/courses' };
    return map[deepLinkMode] || '/notifications';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert('Please fill all fields');
    if (targetGroup === 'courses' && selectedCourseIds.length === 0) {
      return alert('Please select at least one batch/course.');
    }

    setLoading(true);
    try {
      await notificationService.sendNotification({
        title,
        message,
        type: notificationType,
        targetType: targetGroup,
        targetCourseIds: targetGroup === 'courses' ? selectedCourseIds : [],
        meta: { deepLink: resolveDeepLink() },
      });
      alert('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setSelectedCourseIds([]);
      setDeepLinkMode('notifications');
      setDeepLinkCustom('');
      loadHistory();
    } catch (error) {
      console.error(error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-500 mt-1">Broadcast announcements, updates, and alerts to your students.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Target Audience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Target Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['all', 'courses'].map((type) => (
                  <label 
                    key={type}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      targetGroup === type ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="target" 
                      checked={targetGroup === type} 
                      onChange={() => setTargetGroup(type)}
                      className="text-brand-blue focus:ring-brand-blue" 
                    />
                    <span className="text-sm font-semibold capitalize text-gray-700">
                      {type === 'all' ? 'All Students' : 'Specific Batches / Courses'}
                    </span>
                  </label>
                ))}
              </div>
              {targetGroup === 'courses' ? (
                <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Select one or multiple batches. Notification will be sent only to students enrolled in selected batches.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {courses.map((course) => (
                      <label key={course.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedCourseIds((prev) =>
                              checked ? [...prev, course.id] : prev.filter((id) => id !== course.id)
                            );
                          }}
                        />
                        <span className="font-medium text-gray-700">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Notification Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notification Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all" 
                  placeholder="Enter title" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message Body</label>
                <textarea 
                  rows="5" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all" 
                  placeholder="Write your announcement here..."
                ></textarea>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Open in app when student taps notification</label>
              <p className="text-xs text-gray-500 mb-3">Uses the same routes as the student app hash (e.g. <code className="bg-gray-100 px-1 rounded">/notifications</code>).</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {[
                  { id: 'notifications', label: 'Alerts' },
                  { id: 'home', label: 'Home' },
                  { id: 'courses', label: 'Courses' },
                  { id: 'custom', label: 'Custom path' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                      deepLinkMode === opt.id ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deepLink"
                      checked={deepLinkMode === opt.id}
                      onChange={() => setDeepLinkMode(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {deepLinkMode === 'custom' ? (
                <input
                  type="text"
                  value={deepLinkCustom}
                  onChange={(e) => setDeepLinkCustom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue"
                  placeholder="/notifications or /home"
                />
              ) : null}
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Message Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'info', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Info' },
                  { id: 'success', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Success' },
                  { id: 'warning', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Warning' },
                  { id: 'alert', icon: Bell, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Alert' }
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <label 
                      key={type.id}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-all text-center ${
                        notificationType === type.id ? `border-gray-400 shadow-md ${type.bg}` : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="notifType" 
                        checked={notificationType === type.id} 
                        onChange={() => setNotificationType(type.id)}
                        className="hidden"
                      />
                      <Icon className={type.color} size={24} />
                      <span className="text-xs font-bold text-gray-700">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span>{loading ? 'Sending...' : 'Send Notification'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notification History</h2>
            <p className="text-sm text-gray-500">View and manage previously sent announcements.</p>
          </div>
          <button 
            onClick={loadHistory}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            title="Refresh history"
          >
            <Loader2 className={loadingHistory ? "animate-spin" : ""} size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-8 py-4">Notification</th>
                <th className="px-8 py-4">Target</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-gray-400">
                    {loadingHistory ? 'Loading history...' : 'No notifications sent yet.'}
                  </td>
                </tr>
              ) : (
                history.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 line-clamp-1">{n.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2 mt-0.5">{n.message}</div>
                      {n.type && (
                        <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          n.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                          n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                          n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-gray-700">
                        {n.targetType === 'all' ? 'All Students' : `${n.targetCourseIds?.length || 0} Batches`}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">
                      {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(n.id)}
                        className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

