import React, { useEffect, useState } from 'react';
import { Send, Bell, Info, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    (async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

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
    </div>
  );
};

export default Notifications;

