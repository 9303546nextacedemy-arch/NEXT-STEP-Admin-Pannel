import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { studentService } from '../services/studentService';
import { courseService } from '../services/courseService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    enrolledCourses: []
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data.filter(c => c.isActive));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) return;
    try {
      setLoading(true);
      // Ensure phone has +91 prefix
      let formattedPhone = formData.phone.trim();
      if (!formattedPhone.startsWith('+91')) {
        formattedPhone = '+91' + formattedPhone;
      }
      const normalizedEmail = formData.email.trim().toLowerCase();
      const studentData = {
        ...formData,
        phone: formattedPhone,
        ...(normalizedEmail
          ? { email: normalizedEmail, emailLower: normalizedEmail }
          : { email: "", emailLower: "" }),
        isActive: editingStudent ? editingStudent.isActive : true
      };

      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, studentData);
      } else {
        await studentService.addStudent(studentData);
      }
      
      setFormData({ name: '', phone: '', email: '', enrolledCourses: [] });
      setEditingStudent(null);
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      alert("Action failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseEnrollment = (courseId) => {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.includes(courseId)
        ? prev.enrolledCourses.filter(id => id !== courseId)
        : [...prev.enrolledCourses, courseId]
    }));
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      phone: student.phone.startsWith('+91') ? student.phone.substring(3) : student.phone,
      email: student.email || '',
      enrolledCourses: student.enrolledCourses || []
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (student) => {
    try {
      setLoading(true);
      await studentService.updateStudent(student.id, {
        isActive: !student.isActive
      });
      fetchStudents();
    } catch (error) {
      alert("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      setLoading(true);
      await studentService.deleteStudent(id);
      fetchStudents();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all students in your academy.</p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setFormData({ name: '', phone: '', email: '', enrolledCourses: [] }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by phone number..." 
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">{student.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{student.phone}</span>
                      {student.email && <span className="text-xs text-gray-500">{student.email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue">
                      {student.enrolledCourses?.length || 0} Enrolled
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      student.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(student)}
                        title="Edit Student"
                        className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(student)}
                        title={student.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-lg transition-colors ${
                          student.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {student.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. 9999999999"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Country code +91 will be added automatically.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address (optional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email (optional)"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Courses</label>
                  <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50 max-h-48 overflow-y-auto custom-scrollbar">
                    {courses.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No active courses available.</p>
                    ) : (
                      courses.map(course => (
                        <label key={course.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                          <input 
                            type="checkbox"
                            checked={formData.enrolledCourses.includes(course.id)}
                            onChange={() => toggleCourseEnrollment(course.id)}
                            className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                          />
                          <span className="text-sm font-medium text-gray-800">{course.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                form="student-form"
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50"
              >
                {loading ? (editingStudent ? 'Updating...' : 'Creating...') : (editingStudent ? 'Update Student' : 'Create Student')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
