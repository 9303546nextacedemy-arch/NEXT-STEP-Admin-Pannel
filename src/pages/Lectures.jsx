import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Video, Play, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { lectureService } from '../services/lectureService';
import { courseService } from '../services/courseService';
import { chapterService } from '../services/chapterService';
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

const Lectures = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [filterSubjectId, setFilterSubjectId] = useState(FILTER_ALL);
  const [filterChapterId, setFilterChapterId] = useState(FILTER_ALL);
  
  const [chapters, setChapters] = useState([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingChapter, setAddingChapter] = useState(false);
  const [courseFormSubjects, setCourseFormSubjects] = useState([]);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    subjectTitle: '',
    chapterId: '',
    chapterTitle: '',
    videoUrl: '',
    duration: '',
    status: 'Published',
    isLive: false,
    isDemo: false,
    liveScheduledAt: '',
    liveVisibilityMinutes: '60',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses first
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }

      // Then fetch lectures
      try {
        const lecturesData = await lectureService.getLecturesByCourse(selectedCourseId);
        setLectures(lecturesData);
      } catch (error) {
        console.error("Error fetching lectures:", error);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId !== 'all') {
      fetchLectures();
    } else {
      // In a real app, we'd fetch all lectures, but for now let's just clear or fetch all
      fetchLectures();
    }
  }, [selectedCourseId]);

  useEffect(() => {
    setFilterSubjectId(FILTER_ALL);
    setFilterChapterId(FILTER_ALL);
  }, [selectedCourseId]);

  useEffect(() => {
    setFilterChapterId(FILTER_ALL);
  }, [filterSubjectId]);

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

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const data = await lectureService.getLecturesByCourse(selectedCourseId === 'all' ? null : selectedCourseId);
      setLectures(data);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCourseInList = async (courseId) => {
    try {
      const updated = await courseService.getCourseById(courseId);
      if (!updated) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (editingId) {
        await lectureService.updateLecture(editingId, payload);
      } else {
        await lectureService.addLecture(payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', videoUrl: '', duration: '', status: 'Published', isLive: false, isDemo: false, liveScheduledAt: '', liveVisibilityMinutes: '60' });
      setNewChapterTitle('');
      setAddingChapter(false);
      setNewSubjectTitle('');
      setAddingSubject(false);
      fetchLectures();
    } catch (error) {
      alert((editingId ? 'Failed to update lecture: ' : 'Failed to add lecture: ') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      setLoading(true);
      await lectureService.deleteLecture(id);
      fetchLectures();
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

  const subjectFilterOptions = useMemo(
    () => buildSubjectFilterOptions(selectedCourseId, courses, lectures),
    [selectedCourseId, courses, lectures]
  );

  const chapterFilterOptions = useMemo(
    () => buildChapterFilterOptions(lectures, filterSubjectId, selectedCourseId, courses),
    [lectures, filterSubjectId, selectedCourseId, courses]
  );

  const filteredLectures = useMemo(
    () =>
      lectures.filter((row) =>
        matchesSubjectChapterFilters(row, filterSubjectId, filterChapterId)
      ),
    [lectures, filterSubjectId, filterChapterId]
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecture Management</h1>
          <p className="text-gray-500 mt-1">Manage video content and educational sessions.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', videoUrl: '', duration: '', status: 'Published', isLive: false, isDemo: false, liveScheduledAt: '', liveVisibilityMinutes: '60' });
            setNewChapterTitle('');
            setAddingChapter(false);
            setNewSubjectTitle('');
            setAddingSubject(false);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Add Lecture</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search lectures..." className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
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
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && lectures.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lecture Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chapter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration / Schedule</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                          <Play size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 block">{lecture.title}</span>
                            {lecture.isDemo && (
                              <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Demo</span>
                            )}
                          </div>
                          {lecture.description?.trim() ? (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lecture.description.trim()}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lecture.subjectTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lecture.chapterTitle || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        lecture.isLive ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {lecture.isLive ? 'LIVE' : 'RECORDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lecture.isLive
                        ? (lecture.liveScheduledAt ? new Date(lecture.liveScheduledAt).toLocaleString() : 'Instant live')
                        : (lecture.duration || '—')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        lecture.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {lecture.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingId(lecture.id);
                          setFormData({
                            title: lecture.title || '',
                            description: lecture.description || '',
                            courseId: lecture.courseId || '',
                            subjectId: lecture.subjectId || '',
                            subjectTitle: lecture.subjectTitle || '',
                            chapterId: lecture.chapterId || '',
                            chapterTitle: lecture.chapterTitle || '',
                            videoUrl: lecture.videoUrl || '',
                            duration: lecture.duration || '',
                            status: lecture.status || 'Published',
                            isLive: !!lecture.isLive,
                            isDemo: !!lecture.isDemo,
                            liveScheduledAt: formatForDatetimeLocal(lecture.liveScheduledAt),
                            liveVisibilityMinutes:
                              lecture.liveVisibilityMinutes != null && lecture.liveVisibilityMinutes !== ''
                                ? String(lecture.liveVisibilityMinutes)
                                : '60',
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
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(lecture.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                      >
                        <Trash2 size={16} />
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
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Lecture' : 'Add New Lecture'}</h3>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto overscroll-contain px-6 py-4 space-y-4 flex-1 min-h-0 custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lecture Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                  placeholder="Enter title" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue resize-y min-h-[88px] text-sm"
                  placeholder="Short summary for students — what this lecture covers"
                />
              </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lecture Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isLive: false })}
                    className={`px-3 py-2 rounded-xl border text-sm font-bold ${formData.isLive ? 'border-gray-200 text-gray-500' : 'border-indigo-500 bg-indigo-50 text-indigo-700'}`}
                  >
                    Recorded
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isLive: true })}
                    className={`px-3 py-2 rounded-xl border text-sm font-bold ${formData.isLive ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    Live
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <input
                  type="checkbox"
                  id="isDemo"
                  checked={formData.isDemo}
                  onChange={(e) => setFormData({ ...formData, isDemo: e.target.checked })}
                  className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                />
                <label htmlFor="isDemo" className="text-sm font-medium text-amber-900">
                  Mark as Demo Lecture
                  <span className="block text-xs font-normal text-amber-700 mt-0.5">This lecture will be visible to non-enrolled students in the Demo Class section.</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Video URL</label>
                <input 
                  type="text" 
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                  placeholder={formData.isLive ? "YouTube Live / Unlisted live link" : "YouTube (watch / Shorts / youtu.be) or direct .mp4 / Storage URL"} 
                />
              </div>
              {formData.isLive ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Live Schedule (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.liveScheduledAt || ''}
                    onChange={(e) => setFormData({ ...formData, liveScheduledAt: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue"
                  />
                </div>
              ) : null}
              {formData.isLive ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Live listing duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10080}
                    value={formData.liveVisibilityMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, liveVisibilityMinutes: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Lecture stays in the app Live section and home LIVE button for this many minutes, counting from
                    the scheduled time (if set) or from when the lecture was published.
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                  <input 
                    type="text" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder={formData.isLive ? "e.g. 2:00 PM - 3:00 PM" : "MM:SS"} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white"
                  >
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>
              </div>
              <div className="shrink-0 border-t border-gray-100 p-4 flex gap-3 bg-white">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                >
                  {loading
                    ? (editingId ? 'Saving...' : (formData.isLive ? 'Scheduling...' : 'Uploading...'))
                    : (editingId ? 'Save changes' : (formData.isLive ? 'Schedule Live' : 'Upload Lecture'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectures;
