import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, LayoutGrid, List, Loader2, Upload } from 'lucide-react';
import { courseService } from '../services/courseService';
import { teacherService } from '../services/teacherService';
import { storageService } from '../services/storageService';
import { categoryService } from '../services/categoryService';
import { normalizeSubjects, newSubjectId } from '../utils/courseSubjects';

const Courses = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [newCourseSubjectTitle, setNewCourseSubjectTitle] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Computer',
    level: 'Beginner',
    duration: '',
    validity: '',
    price: '',
    subjectCount: '',
    teacherCount: '',
    thumbnailUrl: '',
    bannerUrl: '',
    isActive: true,
    isFeatured: false,
    subjects: [],
    teacherIds: []
  });

  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsCategoryLoading(true);
      if (editingCategoryId) {
        await categoryService.updateCategory(editingCategoryId, newCategoryName);
        setEditingCategoryId(null);
      } else {
        await categoryService.addCategory(newCategoryName);
      }
      setNewCategoryName('');
      await fetchCategories();
    } catch (error) {
      alert("Category operation failed: " + error.message);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure? This will not remove the category from existing courses.")) return;
    try {
      setIsCategoryLoading(true);
      await categoryService.deleteCategory(id);
      await fetchCategories();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'thumbnailUrl') setIsUploading(true);
      else setIsUploadingBanner(true);
      
      const url = await storageService.uploadFile(file, type);
      setFormData({ ...formData, [type]: url });
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      if (type === 'thumbnailUrl') setIsUploading(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await courseService.updateCourse(editingId, formData);
      } else {
        await courseService.addCourse(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ 
        title: '', shortDescription: '', fullDescription: '', 
        category: '', level: 'Beginner', duration: '', validity: '',
        price: '', subjectCount: '', teacherCount: '',
        thumbnailUrl: '', bannerUrl: '', isActive: true, isFeatured: false,
        subjects: [],
        teacherIds: []
      });
      setNewCourseSubjectTitle('');
      fetchCourses();
    } catch (error) {
      alert("Failed to save course: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      setLoading(true);
      await courseService.deleteCourse(id);
      fetchCourses();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  const courseThumbUrl = (c) => c.thumbnailUrl || c.thumbnail || '';
  const courseBannerUrl = (c) => c.bannerUrl || c.thumbnailUrl || c.thumbnail || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 mt-1">Create and manage curriculum across your academy.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({
            title: '', shortDescription: '', fullDescription: '',
            category: categories[0]?.name || 'Computer', level: 'Beginner', duration: '', validity: '',
            price: '', subjectCount: '', teacherCount: '',
            thumbnailUrl: '', bannerUrl: '', isActive: true, isFeatured: false,
            subjects: [],
            teacherIds: []
          }); setNewCourseSubjectTitle(''); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-400 hover:text-brand-blue'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-400 hover:text-brand-blue'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Course Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const thumb = courseThumbUrl(course);
            const banner = courseBannerUrl(course);
            return (
            <div key={course.id} className="bg-white rounded-[24px] border border-gray-100 shadow-premium card-hover group relative overflow-hidden flex flex-col">
              <div className="relative h-44 w-full shrink-0 bg-gradient-to-br from-[#0B2C5F] via-[#123a72] to-[#1a4d8c]">
                {banner ? (
                  <img
                    src={banner}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" aria-hidden />

                <div className="absolute bottom-3 left-4 right-3 flex items-end gap-3">
                  <div className="w-[72px] h-[72px] rounded-2xl border-[3px] border-white shadow-xl overflow-hidden bg-white flex-shrink-0 ring-1 ring-black/10">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-full w-full flex items-center justify-center bg-[#C8A951]/25 text-[#0B2C5F] ${thumb ? 'hidden' : ''}`}>
                      <span className="material-symbols-rounded text-4xl">co_present</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pb-0.5">
                    <h3 className="font-bold text-lg text-white drop-shadow-md truncate font-['Outfit']">{course.title}</h3>
                    <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow">{course.shortDescription || course.category || 'Course'}</p>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                  {course.isFeatured && (
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow">Featured</span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow ${course.isActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-gray-500">
                  {thumb ? <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-600">Thumbnail</span> : null}
                  {course.bannerUrl ? <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-600">Banner</span> : null}
                  {!thumb && !course.bannerUrl ? (
                    <span className="text-amber-700 font-medium">Add images via Edit</span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-gray-500 font-medium mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-base">schedule</span>
                    {course.duration || '—'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-base">book</span>
                    {course.subjectCount || '—'}
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="material-symbols-rounded text-base">group</span>
                    {course.teacherCount || '—'}
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mb-5">
                  <span className="material-symbols-rounded text-base">payments</span>
                  {course.price || `₹6,000/subject — ${course.level || 'All Mediums'}`}
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...course, subjects: normalizeSubjects(course.subjects) }); setEditingId(course.id); setIsModalOpen(true); setNewCourseSubjectTitle(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-[#0B2C5F] text-[#0B2C5F] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={18} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(course.id)}
                    className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Pricing & Meta</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => {
                  const thumb = courseThumbUrl(course);
                  const banner = courseBannerUrl(course);
                  return (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex shrink-0 gap-1.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
                            {thumb ? (
                              <img src={thumb} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-[#C8A951]/30 text-[#0B2C5F]">
                                <span className="material-symbols-rounded text-2xl">co_present</span>
                              </div>
                            )}
                          </div>
                          {course.bannerUrl && banner !== thumb ? (
                            <div className="w-14 h-9 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 self-center hidden sm:block" title="Banner">
                              <img src={course.bannerUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 font-['Outfit']">{course.title}</h4>
                          <p className="text-xs text-gray-500">{course.category} • {course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <span className="material-symbols-rounded text-base">payments</span>
                          {course.price || "₹6,000/subject"}
                        </div>
                        <div className="text-[11px] text-gray-400 flex gap-3">
                          <span>{course.subjectCount || "4 Subjects"}</span>
                          <span>{course.teacherCount || "8 Teachers"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setFormData({ ...course, subjects: normalizeSubjects(course.subjects) }); setEditingId(course.id); setIsModalOpen(true); setNewCourseSubjectTitle(''); }}
                          className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setNewCourseSubjectTitle(''); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              <form id="course-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="Enter course title" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="Brief 1-2 sentence overview" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Description</label>
                    <textarea 
                      rows="4" 
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="Detailed course description..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Category</label>
                      <button 
                        type="button"
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="text-xs text-brand-blue font-bold hover:underline"
                      >
                        {showCategoryManager ? 'Back to Select' : 'Manage Categories'}
                      </button>
                    </div>

                    {showCategoryManager ? (
                      <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name..."
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-blue"
                          />
                          <button 
                            type="button"
                            onClick={handleAddCategory}
                            disabled={isCategoryLoading}
                            className="p-1.5 bg-brand-blue text-white rounded-lg disabled:opacity-50"
                          >
                            {editingCategoryId ? <Edit2 size={16} /> : <Plus size={16} />}
                          </button>
                          {editingCategoryId && (
                            <button 
                              type="button"
                              onClick={() => { setEditingCategoryId(null); setNewCategoryName(''); }}
                              className="p-1.5 bg-gray-200 text-gray-600 rounded-lg"
                            >
                              <Plus className="rotate-45" size={16} />
                            </button>
                          )}
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 group">
                              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  type="button"
                                  onClick={() => { setEditingCategoryId(cat.id); setNewCategoryName(cat.name); }} 
                                  className="p-1 text-gray-400 hover:text-brand-blue"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)} 
                                  className="p-1 text-gray-400 hover:text-rose-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {categories.length === 0 && <p className="text-[11px] text-gray-400 text-center py-2">No categories yet</p>}
                        </div>
                      </div>
                    ) : (
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
                    <select 
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                    <input 
                      type="text" 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="e.g. 20 hours or 10 April" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batch Validity</label>
                    <input
                      type="text"
                      value={formData.validity || ''}
                      onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue"
                      placeholder="e.g. Apr 2024 - Mar 2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (Number)</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="e.g. 6000" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject Count</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.subjectCount}
                      onChange={(e) => setFormData({...formData, subjectCount: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="e.g. 4" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teacher Count</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.teacherCount}
                      onChange={(e) => setFormData({...formData, teacherCount: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="e.g. 8" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subjects (this course / batch)</label>
                    <p className="text-xs text-gray-500 mb-2">These appear when uploading lectures, notes, and live classes. Students filter materials by subject on the course screen.</p>
                    <div className="space-y-2 mb-2">
                      {(formData.subjects || []).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                          <span className="flex-1 text-sm font-medium text-gray-800">{s.title}</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              subjects: (prev.subjects || []).filter((x) => x.id !== s.id),
                            }))}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCourseSubjectTitle}
                        onChange={(e) => setNewCourseSubjectTitle(e.target.value)}
                        placeholder="Subject name, e.g. Physics"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const t = newCourseSubjectTitle.trim();
                          if (!t) return;
                          setFormData((prev) => ({
                            ...prev,
                            subjects: [...(prev.subjects || []), { id: newSubjectId(), title: t }],
                          }));
                          setNewCourseSubjectTitle('');
                        }}
                        className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Teachers *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-48 overflow-y-auto custom-scrollbar">
                      {teachers.map((teacher) => (
                        <label key={teacher.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={(formData.teacherIds || []).includes(teacher.id)}
                            onChange={(e) => {
                              const ids = [...(formData.teacherIds || [])];
                              if (e.target.checked) {
                                if (!ids.includes(teacher.id)) ids.push(teacher.id);
                              } else {
                                const index = ids.indexOf(teacher.id);
                                if (index > -1) ids.splice(index, 1);
                              }
                              setFormData({ ...formData, teacherIds: ids });
                            }}
                            className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                          />
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
                              {teacher.imageUrl ? <img src={teacher.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><User size={14} /></div>}
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate group-hover:text-brand-blue transition-colors">{teacher.name}</span>
                          </div>
                        </label>
                      ))}
                      {teachers.length === 0 && (
                        <div className="col-span-2 text-center py-4 text-gray-400 text-sm italic">
                          No teachers found. Add teachers in the "Teachers" section.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-4 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                      />
                      <span className="text-sm font-semibold text-gray-700">Is Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Featured Course</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thumbnail Image (Required) *</label>
                    <div className="flex gap-4 items-center">
                      {formData.thumbnailUrl && <img src={formData.thumbnailUrl} className="w-20 h-14 rounded-lg object-cover border border-gray-100" />}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-brand-blue transition-colors">
                          {isUploading ? <Loader2 className="animate-spin text-brand-blue" size={20} /> : <Upload size={20} className="text-gray-400" />}
                          <span className="text-sm text-gray-500 font-medium">{isUploading ? 'Uploading...' : 'Upload Thumbnail'}</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image (Optional)</label>
                    <div className="flex gap-4 items-center">
                      {formData.bannerUrl && <img src={formData.bannerUrl} className="w-20 h-10 rounded-lg object-cover border border-gray-100" />}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-brand-blue transition-colors">
                          {isUploadingBanner ? <Loader2 className="animate-spin text-brand-blue" size={20} /> : <Upload size={20} className="text-gray-400" />}
                          <span className="text-sm text-gray-500 font-medium">{isUploadingBanner ? 'Uploading...' : 'Upload Banner'}</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bannerUrl')} />
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setNewCourseSubjectTitle(''); }} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button 
                form="course-form"
                type="submit" 
                disabled={loading || isUploading || isUploadingBanner}
                className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Course' : 'Create Course')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
