import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Radio, Calendar, ExternalLink, Edit2, Trash2, Loader2, Video, Play, Users } from 'lucide-react';

import { liveClassService } from '../services/liveClassService';
import { courseService } from '../services/courseService';
import { chapterService } from '../services/chapterService';
import { adminSettingsService } from '../services/adminSettingsService';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { normalizeSubjects } from '../utils/courseSubjects';
import {
  FILTER_ALL,
  matchesSubjectChapterFilters,
  buildSubjectFilterOptions,
  buildChapterFilterOptions,
} from '../utils/materialFilters';

function formatForDatetimeLocal(v) {
  if (!v) return '';
  const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const LiveClasses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [filterSubjectId, setFilterSubjectId] = useState(FILTER_ALL);
  const [filterChapterId, setFilterChapterId] = useState(FILTER_ALL);
  const [chapters, setChapters] = useState([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingChapter, setAddingChapter] = useState(false);
  const [courseFormSubjects, setCourseFormSubjects] = useState([]);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  
  // Live Config & Control Room States
  const [jitsiSettings, setJitsiSettings] = useState({ domain: 'meet.jit.si', appId: '', secret: '' });
  const [activeControlClass, setActiveControlClass] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [youtubeCreating, setYoutubeCreating] = useState(false);


  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    subjectId: '',
    subjectTitle: '',
    chapterId: '',
    chapterTitle: '',
    dateTime: '',
    link: '',
    meetingType: 'jitsi', // 'jitsi' or 'manual'
    jitsiRoomName: '',
    broadcastToYoutube: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.courseId) {
      setChapters([]);
      return;
    }
    const subjectScope = formData.subjectId ? formData.subjectId : null;
    let cancelled = false;
    (async () => {
      try {
        const list = await chapterService.getChaptersByCourse(formData.courseId, subjectScope);
        if (!cancelled) setChapters(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setChapters([]);
      }
    })();
    return () => { cancelled = true; };
  }, [formData.courseId, formData.subjectId]);

  useEffect(() => {
    const c = courses.find((x) => x.id === formData.courseId);
    setCourseFormSubjects(c ? normalizeSubjects(c.subjects) : []);
  }, [formData.courseId, courses]);

  const refreshCourseInList = async (courseId) => {
    try {
      const updated = await courseService.getCourseById(courseId);
      if (!updated) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, classesData, jitsiData] = await Promise.all([
        courseService.getAllCourses(),
        liveClassService.getLiveClassesByCourse(selectedCourseId),
        adminSettingsService.getJitsiSettings()
      ]);
      setCourses(coursesData);
      setClasses(classesData);
      setJitsiSettings(jitsiData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedCourseId]);

  useEffect(() => {
    setFilterSubjectId(FILTER_ALL);
    setFilterChapterId(FILTER_ALL);
  }, [selectedCourseId]);

  useEffect(() => {
    setFilterChapterId(FILTER_ALL);
  }, [filterSubjectId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await liveClassService.getLiveClassesByCourse(selectedCourseId);
      setClasses(data);
    } catch (error) {
      console.error("Error fetching live classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSave = { ...formData };
      if (dataToSave.meetingType === 'jitsi') {
        if (!dataToSave.jitsiRoomName) {
          dataToSave.jitsiRoomName = 'NextStep_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
        }
        const domain = jitsiSettings.domain || 'meet.jit.si';
        dataToSave.link = `https://${domain}/${dataToSave.jitsiRoomName}`;
        if (!editingId) {
          dataToSave.status = 'SCHEDULED';
        }
      } else {
        dataToSave.jitsiRoomName = '';
        if (!editingId) {
          dataToSave.status = 'SCHEDULED';
        }
      }
      if (editingId) {
        await liveClassService.updateLiveClass(editingId, dataToSave);
      } else {
        await liveClassService.addLiveClass(dataToSave);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', dateTime: '', link: '', meetingType: 'jitsi', jitsiRoomName: '', broadcastToYoutube: false });
      setNewChapterTitle('');
      setAddingChapter(false);
      setNewSubjectTitle('');
      setAddingSubject(false);
      fetchClasses();
    } catch (error) {
      alert((editingId ? 'Failed to update session: ' : 'Failed to schedule class: ') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      setLoading(true);
      await liveClassService.deleteLiveClass(id);
      fetchClasses();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubjectQuick = async () => {
    const t = newSubjectTitle.trim();
    if (!formData.courseId) {
      alert('Please select a course first.');
      return;
    }
    if (!t) {
      alert('Please enter a subject name.');
      return;
    }
    try {
      setLoading(true);
      const subj = await courseService.appendSubjectToCourse(formData.courseId, { title: t });
      await refreshCourseInList(formData.courseId);
      setFormData((prev) => ({
        ...prev,
        subjectId: subj.id,
        subjectTitle: subj.title,
        chapterId: '',
        chapterTitle: '',
      }));
      setNewSubjectTitle('');
      setAddingSubject(false);
    } catch (e) {
      alert(e.message || 'Subject add failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapterQuick = async () => {
    const t = newChapterTitle.trim();
    if (!formData.courseId) {
      alert('Please select a course first.');
      return;
    }
    if (!t) {
      alert('Please enter a chapter title.');
      return;
    }
    const subs = normalizeSubjects(courses.find((c) => c.id === formData.courseId)?.subjects);
    if (subs.length > 0 && !formData.subjectId) {
      alert('Please select a subject first. Chapters are saved under the selected subject.');
      return;
    }
    try {
      setLoading(true);
      const id = await chapterService.addChapter({
        courseId: formData.courseId,
        title: t,
        subjectId: formData.subjectId || undefined,
        subjectTitle: formData.subjectTitle,
      });
      const scope = formData.subjectId ? formData.subjectId : null;
      const list = await chapterService.getChaptersByCourse(formData.courseId, scope);
      setChapters(list);
      const created = list.find((c) => c.id === id);
      setFormData((prev) => ({
        ...prev,
        chapterId: id,
        chapterTitle: created?.title || t,
      }));
      setNewChapterTitle('');
      setAddingChapter(false);
    } catch (e) {
      alert(e.message || 'Chapter add failed');
    } finally {
      setLoading(false);
    }
  };

  const subjectFilterOptions = useMemo(
    () => buildSubjectFilterOptions(selectedCourseId, courses, classes),
    [selectedCourseId, courses, classes]
  );

  const chapterFilterOptions = useMemo(
    () => buildChapterFilterOptions(classes, filterSubjectId, selectedCourseId, courses),
    [classes, filterSubjectId, selectedCourseId, courses]
  );

  const filteredClasses = useMemo(
    () =>
      classes.filter((row) =>
        matchesSubjectChapterFilters(row, filterSubjectId, filterChapterId)
      ),
    [classes, filterSubjectId, filterChapterId]
  );

  const handleCloseControlRoom = () => {
    setActiveControlClass(null);
  };


  useEffect(() => {
    if (!activeControlClass) {
      setAttendees([]);
      return;
    }
    
    const q = query(
      collection(db, 'live_attendance'),
      where('classId', '==', activeControlClass.id)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setAttendees(records.sort((a, b) => {
        const ta = a.joinedAt?.toMillis ? a.joinedAt.toMillis() : 0;
        const tb = b.joinedAt?.toMillis ? b.joinedAt.toMillis() : 0;
        return tb - ta;
      }));
    }, (error) => {
      console.error("Error listening to attendance:", error);
    });
    
    return () => unsubscribe();
  }, [activeControlClass]);

  const createYoutubeBroadcastForClass = async (classId) => {
    setYoutubeCreating(true);
    try {
      const response = await fetch("https://asia-south1-next-step-academy-5b9ab.cloudfunctions.net/createLiveBroadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed');

      setActiveControlClass(prev => prev ? {
        ...prev,
        status: 'LIVE',
        youtubeVideoId: data.youtubeVideoId,
        youtubeRtmpUrl: data.youtubeRtmpUrl,
        youtubeStreamKey: data.youtubeStreamKey
      } : null);

      setClasses(prev => prev.map(c => c.id === classId ? {
        ...c, status: 'LIVE', youtubeVideoId: data.youtubeVideoId
      } : c));

      return data.youtubeStreamKey;
    } finally {
      setYoutubeCreating(false);
    }
  };

  const handleLaunchClass = async (cls) => {
    const room = cls.jitsiRoomName || `NextStepClass_${cls.id}`;
    const domain = jitsiSettings.domain || 'meet.jit.si';

    const parts = [
      'config.prejoinPageEnabled=false',
      'config.startWithAudioMuted=false',
      'config.disableDeepLinking=true',
      'config.requireDisplayName=false',
      'config.lobby.enabled=false',
      'config.lobby.autoKnock=false',
      'config.enableClosePage=false',
      'interfaceConfig.HIDE_LOBBY_BUTTON=true',
      'config.resolution=1080',
      'config.constraints.video.height.ideal=1080',
      'config.desktopSharingResolution.width=1920',
      'config.desktopSharingResolution.height=1080'
    ];

    try {
      const { auth } = await import('../lib/firebase');
      if (auth.currentUser) {
        const userInfo = {
          displayName: auth.currentUser.displayName || 'Admin User',
          email: auth.currentUser.email || ''
        };
        parts.push(`userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`);
      }
    } catch (e) {
      console.warn('Failed to load auth user info for Jitsi launch:', e);
    }

    const jitsiUrl = `https://${domain}/${room}#${parts.join('&')}`;

    window.open(jitsiUrl, '_blank');
    setActiveControlClass(cls);

    // Send "Live Now" notification to batch students
    if (cls.courseId && cls.status !== 'LIVE') {
      try {
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'notifications'), {
          title: `🔴 Live Now: ${cls.title || 'Live Class'}`,
          message: cls.subjectTitle
            ? `${cls.subjectTitle}${cls.chapterTitle ? ' — ' + cls.chapterTitle : ''} is starting now! Join immediately.`
            : 'A live class is starting now! Open the Live section to join.',
          type: 'alert',
          targetType: 'courses',
          targetCourseIds: [cls.courseId],
          meta: { deepLink: '/live', kind: 'live', courseId: cls.courseId, classId: cls.id },
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error('Live Now notification failed:', e);
      }
    }

    if (cls.broadcastToYoutube) {
      try {
        await createYoutubeBroadcastForClass(cls.id);
      } catch (err) {
        console.error('Auto YouTube broadcast failed:', err.message);
      }
    } else {
      // If not broadcasting to YouTube, we still need to mark it as LIVE in Firestore
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(db, 'liveClasses', cls.id), {
          status: 'LIVE',
          startedAt: serverTimestamp()
        });
        setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, status: 'LIVE' } : c));
      } catch (err) {
        console.error('Failed to update class status to LIVE:', err);
      }
    }
  };


  const handleStartYoutubeBroadcast = async () => {
    if (!activeControlClass) return;
    try {
      await createYoutubeBroadcastForClass(activeControlClass.id);
    } catch (error) {
      alert("Failed to create YouTube broadcast: " + error.message);
    }
  };

  const handleEndClass = async () => {
    if (!activeControlClass) return;
    if (!window.confirm("Class end karna chahte hain?\n\nYe hoga:\n✓ Sabhi students automatically disconnect ho jaayenge\n✓ YouTube live stream band ho jaayegi\n✓ Recording save ho jaayegi")) return;

    try {
      setLoading(true);
      
      if (activeControlClass.broadcastToYoutube) {
        const response = await fetch("https://asia-south1-next-step-academy-5b9ab.cloudfunctions.net/endLiveBroadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId: activeControlClass.id })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to finalize broadcast');
        }
      } else {
        // Just update Firestore status if no broadcast
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(db, 'liveClasses', activeControlClass.id), {
          status: 'ENDED',
          endedAt: serverTimestamp()
        });
      }

      handleCloseControlRoom();
      fetchClasses();
      setTimeout(() => {
        alert('Class end ho gayi! ✅\n\nAbhi Jitsi tab mein jao → "End meeting for all" click karo — taaki jo bhi Jitsi mein hain unhe bhi remove kar sake.');
      }, 300);
    } catch (error) {
      alert("Class end karne mein problem: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text) => {
    alert(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-500 mt-1">Schedule and manage real-time interactive sessions.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', dateTime: '', link: '', meetingType: 'jitsi', jitsiRoomName: '', broadcastToYoutube: false });
            setNewChapterTitle('');
            setAddingChapter(false);
            setNewSubjectTitle('');
            setAddingSubject(false);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Calendar size={20} />
          <span>Schedule Class</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-wrap gap-2 justify-end items-center">
          <select
            aria-label="Filter by course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2 outline-none min-w-[140px]"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by subject"
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2 outline-none min-w-[140px]"
          >
            {subjectFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by chapter"
            value={filterChapterId}
            onChange={(e) => setFilterChapterId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2 outline-none min-w-[140px]"
          >
            {chapterFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading && classes.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chapter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Join Link</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
                          <Radio size={18} className="animate-pulse" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{cls.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cls.subjectTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cls.chapterTitle || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(cls.dateTime).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cls.meetingType === 'jitsi' ? (
                        (cls.status === 'ENDED' || cls.status === 'COMPLETED') ? (
                          <span className="text-gray-400 text-xs font-bold uppercase bg-gray-100 px-2.5 py-1 rounded-full">Ended</span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLaunchClass(cls)}
                              className="inline-flex items-center gap-1.5 bg-brand-blue text-white px-3.5 py-1.5 rounded-xl hover:bg-brand-blue/90 transition-all font-bold text-xs shadow-md shadow-brand-blue/10"
                            >
                              <Video size={14} />
                              <span>Launch Class</span>
                            </button>
                          </div>
                        )
                      ) : (
                        <a href={cls.link} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline flex items-center gap-1 text-sm font-medium">
                          Join Class <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingId(cls.id);
                          setFormData({
                            title: cls.title || '',
                            courseId: cls.courseId || '',
                            subjectId: cls.subjectId || '',
                            subjectTitle: cls.subjectTitle || '',
                            chapterId: cls.chapterId || '',
                            chapterTitle: cls.chapterTitle || '',
                            dateTime: formatForDatetimeLocal(cls.dateTime),
                            link: cls.link || '',
                            meetingType: cls.meetingType || 'manual',
                            jitsiRoomName: cls.jitsiRoomName || '',
                            broadcastToYoutube: cls.broadcastToYoutube || false,
                          });
                          setNewChapterTitle('');
                          setAddingChapter(false);
                          setNewSubjectTitle('');
                          setAddingSubject(false);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors inline-block"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cls.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] min-h-0 flex flex-col overflow-hidden shadow-2xl my-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit live class' : 'Schedule Live Class'}</h3>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto overscroll-contain px-6 py-4 space-y-4 flex-1 min-h-0 custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Course</label>
                <select 
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value, subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: ''})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject (optional)</label>
                <p className="text-xs text-gray-500 mb-2">Subjects are defined on the course. Pick one or add a new subject for this course.</p>
                <div className="flex flex-col gap-2">
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const s = courseFormSubjects.find((x) => x.id === id);
                      setFormData({
                        ...formData,
                        subjectId: id,
                        subjectTitle: s ? s.title : '',
                        chapterId: '',
                        chapterTitle: '',
                      });
                    }}
                    disabled={!formData.courseId}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white disabled:opacity-50"
                  >
                    <option value="">No subject</option>
                    {courseFormSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  {!addingSubject ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.courseId) {
                          alert('Please select a course first.');
                          return;
                        }
                        setAddingSubject(true);
                      }}
                      className="text-xs font-bold text-brand-blue hover:underline text-left"
                    >
                      Add new subject
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectTitle}
                        onChange={(e) => setNewSubjectTitle(e.target.value)}
                        placeholder="Subject name"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button type="button" onClick={handleAddSubjectQuick} className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg">Add</button>
                      <button type="button" onClick={() => { setAddingSubject(false); setNewSubjectTitle(''); }} className="px-2 text-gray-500 text-xs">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chapter (optional)</label>
                <p className="text-xs text-gray-500 mb-2">Chapters listed here match the subject selected above. Add a new chapter to attach it to that subject.</p>
                <div className="flex flex-col gap-2">
                  <select
                    value={formData.chapterId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const ch = chapters.find((c) => c.id === id);
                      setFormData({
                        ...formData,
                        chapterId: id,
                        chapterTitle: ch ? ch.title : '',
                      });
                    }}
                    disabled={!formData.courseId}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white disabled:opacity-50"
                  >
                    <option value="">No chapter</option>
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                  {!addingChapter ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.courseId) {
                          alert('Please select a course first.');
                          return;
                        }
                        setAddingChapter(true);
                      }}
                      className="text-xs font-bold text-brand-blue hover:underline text-left"
                    >
                      Add new chapter
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        placeholder="Chapter title"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button type="button" onClick={handleAddChapterQuick} className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg">Add</button>
                      <button type="button" onClick={() => { setAddingChapter(false); setNewChapterTitle(''); }} className="px-2 text-gray-500 text-xs">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                  placeholder="Enter session title" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Platform</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white"
                >
                  <option value="jitsi">Jitsi Classroom (Interactive)</option>
                  <option value="manual">Manual Link (Zoom, Google Meet, YouTube Live)</option>
                </select>
              </div>
              {formData.meetingType === 'jitsi' && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.broadcastToYoutube}
                      onChange={(e) => setFormData({...formData, broadcastToYoutube: e.target.checked})}
                      className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">Broadcast to YouTube</span>
                      <span className="text-xs text-gray-500">Automatically stream this class to your connected YouTube channel</span>
                    </div>
                  </label>
                </div>
              )}
              {formData.meetingType === 'manual' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Link</label>
                  <input 
                    type="text" 
                    required={formData.meetingType === 'manual'}
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder="Zoom, Google Meet, etc." 
                  />
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50 border border-blue-100 text-brand-blue rounded-xl text-xs font-semibold">
                  Jitsi Room Name & Join URL will be automatically configured for students.
                </div>
              )}
              </div>
              <div className="shrink-0 border-t border-gray-100 p-4 flex gap-3 bg-white">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                >
                  {loading ? (editingId ? 'Saving...' : 'Scheduling...') : (editingId ? 'Save changes' : 'Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Control Room Panel (Monitoring Dashboard) */}
      {activeControlClass && (
        <div className="fixed inset-0 bg-gray-950 z-[150] flex flex-col overflow-hidden font-sans text-left">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-blue/20 text-brand-blue">Control Room</span>
              <h2 className="text-lg font-bold text-white mt-1 truncate">{activeControlClass.title}</h2>
              <p className="text-xs text-gray-400">{activeControlClass.subjectTitle || 'No Subject'} • {activeControlClass.chapterTitle || 'No Chapter'}</p>
            </div>
            <div className="flex gap-3 shrink-0 ml-4">
              <button
                onClick={async () => {
                  const room = activeControlClass.jitsiRoomName || `NextStepClass_${activeControlClass.id}`;
                  const domain = jitsiSettings.domain || 'meet.jit.si';
                  
                  const parts = [
                    'config.prejoinPageEnabled=false',
                    'config.startWithAudioMuted=false',
                    'config.disableDeepLinking=true',
                    'config.requireDisplayName=false',
                    'config.lobby.enabled=false',
                    'config.lobby.autoKnock=false',
                    'config.enableClosePage=false',
                    'interfaceConfig.HIDE_LOBBY_BUTTON=true',
                    'config.resolution=1080',
                    'config.constraints.video.height.ideal=1080',
                    'config.desktopSharingResolution.width=1920',
                    'config.desktopSharingResolution.height=1080'
                  ];

                  try {
                    const { auth } = await import('../lib/firebase');
                    if (auth.currentUser) {
                      const userInfo = {
                        displayName: auth.currentUser.displayName || 'Admin User',
                        email: auth.currentUser.email || ''
                      };
                      parts.push(`userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`);
                    }
                  } catch (e) {
                    console.warn('Failed to load auth user info for Jitsi launch:', e);
                  }

                  const jitsiUrl = `https://${domain}/${room}#${parts.join('&')}`;
                  window.open(jitsiUrl, '_blank');
                }}
                className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-blue/20"
              >
                <Video size={16} />
                <span>Join Class (New Tab)</span>
              </button>
              <button
                onClick={() => handleCloseControlRoom()}
                className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                title="Minimize"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h4 className="font-bold text-sm text-gray-300 mb-3 flex items-center gap-2"><Play size={15} /> Class Info</h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <p className="text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Room Name</p>
                  <p className="text-gray-200 font-mono break-all">{activeControlClass.jitsiRoomName || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Direct Link</p>
                  <div className="text-brand-blue truncate mt-0.5">
                    <a 
                      href={`https://meet.jit.si/${activeControlClass.jitsiRoomName || ''}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      meet.jit.si/{activeControlClass.jitsiRoomName || '—'}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Scheduled</p>
                  <p className="text-gray-200">{new Date(activeControlClass.dateTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    activeControlClass.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                    (activeControlClass.status === 'ENDED' || activeControlClass.status === 'COMPLETED') ? 'bg-gray-700 text-gray-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{activeControlClass.status || 'SCHEDULED'}</span>
                </div>
              </div>
            </div>
            {/* YouTube Stream Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h4 className="font-bold text-sm text-gray-300 mb-3 flex items-center gap-2"><Radio size={15} /> YouTube Live Stream</h4>
              {activeControlClass.youtubeVideoId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block"></span>
                    Broadcast Ready
                  </div>

                  {activeControlClass.youtubeStreamKey && (
                    <div className="p-3 bg-black/40 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] text-yellow-400 uppercase font-bold">Stream Key — Jitsi mein paste karo</p>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(activeControlClass.youtubeStreamKey)
                              .then(() => alert('Stream key copied to clipboard!'))
                              .catch(() => {});
                          }}
                          className="text-[10px] bg-brand-blue/20 hover:bg-brand-blue text-brand-blue hover:text-white px-2 py-1 rounded transition-colors font-bold"
                        >Copy</button>
                      </div>
                      <p className="text-xs font-mono text-yellow-200 break-all select-all leading-relaxed p-1.5 bg-black/50 rounded">{activeControlClass.youtubeStreamKey}</p>
                    </div>
                  )}

                  <a
                    href={`https://www.youtube.com/watch?v=${activeControlClass.youtubeVideoId}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-red-600/10 border border-red-600/30 text-red-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600/20 transition-all"
                  >
                    <ExternalLink size={16} /> YouTube par Live Dekhein
                  </a>
                  <p className="text-[10px] text-gray-500 text-center">Unlisted — sirf link se access hoga</p>
                </div>
              ) : youtubeCreating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                    <span className="animate-spin">⏳</span>
                    YouTube broadcast create ho raha hai...
                  </div>
                  <p className="text-[10px] text-gray-500">Thoda ruko, automatically stream setup ho raha hai...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-400">Broadcast auto-create nahi ho saka. Retry karein:</p>
                  <button
                    onClick={handleStartYoutubeBroadcast}
                    disabled={loading || youtubeCreating}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Radio size={16} className="animate-pulse" />
                    Retry YouTube Stream
                  </button>
                </div>
              )}
            </div>

            {/* Attendees Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-300 flex items-center gap-2"><Users size={15} /> Attendees</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue">{attendees.length} joined</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48">
                {attendees.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-8">No students joined yet.<br/>They join after you start the class.</p>
                ) : attendees.map((att, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-800/60 p-2.5 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-gray-200">{att.studentName || 'Student'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{att.studentEmail || ''}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">Joined</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 flex gap-3 shrink-0">
            <button
              onClick={() => handleCloseControlRoom()}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl text-sm"
            >
              Minimize
            </button>
            <button
              onClick={handleEndClass}
              disabled={loading}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {loading ? 'Ending...' : 'End Class'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
