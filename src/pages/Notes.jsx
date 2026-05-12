import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Download, Trash2, Search, Check, X, Loader2, Upload, Edit2 } from 'lucide-react';
import { notesService } from '../services/notesService';
import { courseService } from '../services/courseService';
import { chapterService } from '../services/chapterService';
import { storageService } from '../services/storageService';
import { normalizeSubjects } from '../utils/courseSubjects';
import {
  FILTER_ALL,
  matchesSubjectChapterFilters,
  buildSubjectFilterOptions,
  buildChapterFilterOptions,
} from '../utils/materialFilters';

const Notes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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
    fileUrl: '',
    type: 'PDF',
    allowDownload: true
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

      // Then fetch notes
      try {
        const notesData = await notesService.getNotesByCourse(selectedCourseId);
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
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

  const refreshCourseInList = async (courseId) => {
    try {
      const updated = await courseService.getCourseById(courseId);
      if (!updated) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesService.getNotesByCourse(selectedCourseId === 'all' ? null : selectedCourseId);
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await storageService.uploadFile(file, 'notes');
      const ext = file.name.split('.').pop().toUpperCase();
      setFormData({ ...formData, fileUrl: url, type: ext });
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !formData.fileUrl) return alert("Please upload a file first");
    try {
      setLoading(true);
      if (editingId) {
        await notesService.updateNotes(editingId, formData);
      } else {
        await notesService.addNotes(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', fileUrl: '', type: 'PDF', allowDownload: true });
      setNewChapterTitle('');
      setAddingChapter(false);
      setNewSubjectTitle('');
      setAddingSubject(false);
      fetchNotes();
    } catch (error) {
      alert((editingId ? 'Failed to update notes: ' : 'Failed to add notes: ') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDownload = async (note) => {
    try {
      setLoading(true);
      await notesService.updateNotes(note.id, {
        allowDownload: !note.allowDownload
      });
      fetchNotes();
    } catch (error) {
      alert("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete these notes?")) return;
    try {
      setLoading(true);
      await notesService.deleteNotes(id);
      fetchNotes();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const subjectFilterOptions = useMemo(
    () => buildSubjectFilterOptions(selectedCourseId, courses, notes),
    [selectedCourseId, courses, notes]
  );

  const chapterFilterOptions = useMemo(
    () => buildChapterFilterOptions(notes, filterSubjectId, selectedCourseId, courses),
    [notes, filterSubjectId, selectedCourseId, courses]
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter((row) =>
        matchesSubjectChapterFilters(row, filterSubjectId, filterChapterId)
      ),
    [notes, filterSubjectId, filterChapterId]
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes Management</h1>
          <p className="text-gray-500 mt-1">Upload and manage study materials for students.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', courseId: '', subjectId: '', subjectTitle: '', chapterId: '', chapterTitle: '', fileUrl: '', type: 'PDF', allowDownload: true });
            setNewChapterTitle('');
            setAddingChapter(false);
            setNewSubjectTitle('');
            setAddingSubject(false);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Upload New Notes</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search notes..." className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" />
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
          {loading && notes.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">File Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chapter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Allow Download</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-gold shrink-0">
                          <FileText size={18} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{note.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{note.subjectTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{note.chapterTitle || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{note.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleDownload(note)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          note.allowDownload ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          note.allowDownload ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a href={note.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors inline-block"><Download size={18} /></a>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingId(note.id);
                          setFormData({
                            title: note.title || '',
                            courseId: note.courseId || '',
                            subjectId: note.subjectId || '',
                            subjectTitle: note.subjectTitle || '',
                            chapterId: note.chapterId || '',
                            chapterTitle: note.chapterTitle || '',
                            fileUrl: note.fileUrl || '',
                            type: note.type || 'PDF',
                            allowDownload: note.allowDownload !== false,
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
                        onClick={() => handleDelete(note.id)}
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
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit notes' : 'Upload Study Material'}</h3>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto overscroll-contain px-6 py-4 space-y-4 flex-1 min-h-0 custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                  placeholder="e.g. Week 1 Summary" 
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{editingId ? 'Replace file (optional)' : 'Upload File'}</label>
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-brand-blue/30 transition-all bg-gray-50">
                    {isUploading ? <Loader2 className="animate-spin text-brand-blue" size={32} /> : <FileText className="text-gray-400" size={32} />}
                    <p className="text-sm text-gray-500 font-medium">{formData.fileUrl ? (editingId ? 'Current file linked — click to replace' : 'File Uploaded!') : 'Click to upload PDF/DOCX'}</p>
                    <p className="text-xs text-gray-400">Max 10MB</p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                </label>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">Allow Download</p>
                  <p className="text-xs text-gray-500">Students can download this file to their devices</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, allowDownload: !formData.allowDownload})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.allowDownload ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.allowDownload ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              </div>
              <div className="shrink-0 border-t border-gray-100 p-4 flex gap-3 bg-white">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl">Cancel</button>
                <button 
                  type="submit" 
                  disabled={loading || isUploading}
                  className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                >
                  {loading ? (editingId ? 'Saving...' : 'Uploading...') : (editingId ? 'Save changes' : 'Save Notes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
