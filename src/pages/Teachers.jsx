import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, LayoutGrid, List, Loader2, Upload, User } from 'lucide-react';
import { teacherService } from '../services/teacherService';
import { courseService } from '../services/courseService';
import { storageService } from '../services/storageService';

const Teachers = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    teachingCourseIds: [],
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await storageService.uploadFile(file, 'teachers');
      setFormData({ ...formData, imageUrl: url });
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await teacherService.updateTeacher(editingId, formData);
      } else {
        await teacherService.addTeacher(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ 
        name: '', 
        qualification: '', 
        teachingCourseIds: [], 
        description: '', 
        imageUrl: '',
      });
      fetchTeachers();
    } catch (error) {
      alert("Failed to save teacher: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      setLoading(true);
      await teacherService.deleteTeacher(id);
      fetchTeachers();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-500 mt-1">Manage teacher profiles and their details.</p>
        </div>
        <button 
          onClick={() => { 
            setEditingId(null); 
            setFormData({
              name: '', qualification: '', teachingCourseIds: [], description: '', imageUrl: ''
            }); 
            setIsModalOpen(true); 
          }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search teachers..." 
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

      {/* Teachers Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-[24px] border border-gray-100 shadow-premium card-hover group relative overflow-hidden flex flex-col">
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-brand-blue/10 overflow-hidden bg-gray-100 mb-4 shadow-inner">
                  {teacher.imageUrl ? (
                    <img src={teacher.imageUrl} alt={teacher.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-brand-blue">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-900 font-['Outfit'] mb-1">{teacher.name}</h3>
                <p className="text-sm font-semibold text-brand-blue mb-3">{teacher.qualification}</p>
                <div className="w-full h-px bg-gray-100 mb-4"></div>
                <div className="text-sm text-gray-500 mb-4">
                  <p className="font-bold text-gray-700 mb-1">Teaching Courses:</p>
                  <p className="line-clamp-2">
                    {teacher.teachingCourseIds && teacher.teachingCourseIds.length > 0 
                      ? courses.filter(c => teacher.teachingCourseIds.includes(c.id)).map(c => c.title).join(', ')
                      : 'Not specified'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3 mb-6 italic">
                  "{teacher.description || 'No introduction available.'}"
                </p>

                <div className="flex gap-3 mt-auto w-full">
                  <button
                    type="button"
                    onClick={() => { setFormData(teacher); setEditingId(teacher.id); setIsModalOpen(true); }}
                    className="flex-1 py-2.5 rounded-xl border border-[#0B2C5F] text-[#0B2C5F] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={18} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          {teacher.imageUrl ? (
                            <img src={teacher.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-brand-blue bg-blue-50">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 font-['Outfit']">{teacher.name}</h4>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{teacher.qualification}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {teacher.teachingCourseIds && teacher.teachingCourseIds.length > 0 
                        ? courses.filter(c => teacher.teachingCourseIds.includes(c.id)).map(c => c.title).join(', ')
                        : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setFormData(teacher); setEditingId(teacher.id); setIsModalOpen(true); }}
                          className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              <form id="teacher-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder="Enter teacher name" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualification *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder="e.g. B.Tech (IIT Delhi), 8+ Yrs Exp" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teaching Courses *</label>
                  <p className="text-[11px] text-gray-500 mb-2">Select the batches/courses this teacher will teach.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto custom-scrollbar">
                    {courses.map(course => {
                      const isChecked = (formData.teachingCourseIds || []).includes(course.id);
                      return (
                        <label key={course.id} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let newList = [...(formData.teachingCourseIds || [])];
                              if (e.target.checked) {
                                if (!newList.includes(course.id)) newList.push(course.id);
                              } else {
                                newList = newList.filter(id => id !== course.id);
                              }
                              setFormData({ ...formData, teachingCourseIds: newList });
                            }}
                            className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                          />
                          <span className="text-xs font-medium text-gray-600 truncate group-hover:text-brand-blue">{course.title}</span>
                        </label>
                      );
                    })}
                    {courses.length === 0 && <p className="col-span-2 text-center text-[11px] text-gray-400 py-2 italic">No courses found.</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teacher Introduction (Description) *</label>
                  <textarea 
                    rows="4" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder="Tell students about the teacher's background and teaching style..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teacher Image</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-gray-300" size={32} />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-brand-blue transition-colors">
                        {isUploading ? <Loader2 className="animate-spin text-brand-blue" size={20} /> : <Upload size={20} className="text-gray-400" />}
                        <span className="text-sm text-gray-500 font-medium">{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button 
                form="teacher-form"
                type="submit" 
                disabled={loading || isUploading}
                className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {loading ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Profile' : 'Save Teacher')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
