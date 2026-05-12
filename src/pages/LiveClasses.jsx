import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Radio, Calendar, ExternalLink, Edit2, Trash2, Loader2 } from 'lucide-react';
import { liveClassService } from '../services/liveClassService';
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
  
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    subjectId: '',
    subjectTitle: '',
    chapterId: '',
    chapterTitle: '',
    dateTime: '',
    link: ''
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
      const [coursesData, classesData] = await Promise.all([
        courseService.getAllCourses(),
        liveClassService.getLiveClassesByCourse(selectedCourseId)
      ]);
      setCourses(coursesData);
      setClasses(classesData);
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
      if (editingId) {
        await liveClassService.updateLiveClass(editingId, formData);
      } else {
        await liveClassService.addLiveClass(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', dateTime: '', link: '' });
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
            setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', dateTime: '', link: '' });
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
                      <a href={cls.link} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline flex items-center gap-1 text-sm font-medium">
                        Join Class <ExternalLink size={14} />
                      </a>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Link</label>
                <input 
                  type="text" 
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                  placeholder="Zoom, Google Meet, etc." 
                />
              </div>
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
    </div>
  );
};

export default LiveClasses;
