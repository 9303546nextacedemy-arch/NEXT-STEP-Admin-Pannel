import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Trash2, Loader2, Edit3 } from 'lucide-react';
import { projectService } from '../services/projectService';
import { courseService } from '../services/courseService';

const mkId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const PROJECT_THEME_PRESETS = ['#C8A951', '#0B2C5F', '#2563EB', '#7C3AED', '#DC2626', '#059669', '#EA580C'];

const defaultFormData = () => ({
  title: '',
  shortDescription: '',
  fullDescription: '',
  themeColor: '#C8A951',
  isActive: true,
  allowedCourses: [],
  projectContent: [],
});

const normalizeProjectContent = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => ({
      id: String(s.id || mkId('sub')),
      title: String(s.title || '').trim(),
      details: String(
        s.details ||
        (Array.isArray(s.chapters) && s.chapters[0]?.details) ||
        (Array.isArray(s.chapters) && s.chapters[0]?.fullDescription) ||
        ''
      ).trim(),
      chapters: [],
    }))
    .filter((s) => s.title);
};

const firstContentSummary = (project) => {
  const content = normalizeProjectContent(project?.projectContent);
  const firstSubject = content[0];
  return {
    subject: project?.category || firstSubject?.title || 'General',
    chapter: 'Direct Subject Details',
  };
};

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(defaultFormData());
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubjectTitle, setNewSubjectTitle] = useState('');

  useEffect(() => {
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectContent = normalizeProjectContent(formData.projectContent);
      if (projectContent.length === 0) {
        alert('Add at least one subject.');
        return;
      }
      const firstSubject = projectContent[0];
      const payload = {
        ...formData,
        projectContent,
        category: firstSubject?.title || '',
        chapter: '',
        fullDescription: formData.fullDescription || firstSubject?.details || '',
      };
      setLoading(true);
      if (editingProject) {
        await projectService.updateProject(editingProject.id, payload);
      } else {
        await projectService.addProject(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      alert("Failed to save project: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData());
    setSelectedSubjectId('');
    setNewSubjectTitle('');
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    const projectContent =
      normalizeProjectContent(project.projectContent).length > 0
        ? normalizeProjectContent(project.projectContent)
        : [
            {
              id: mkId('sub'),
              title: project.category || 'General',
              details: project.fullDescription || '',
              chapters: [],
            },
          ];

    setEditingProject(project);
    setFormData({
      title: project.title,
      shortDescription: project.shortDescription || '',
      fullDescription: project.fullDescription || '',
      themeColor: project.themeColor || '#C8A951',
      isActive: project.isActive,
      allowedCourses: project.allowedCourses || [],
      projectContent,
    });
    setSelectedSubjectId(projectContent[0]?.id || '');
    setNewSubjectTitle('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (project) => {
    try {
      setLoading(true);
      await projectService.updateProject(project.id, {
        isActive: !project.isActive
      });
      fetchProjects();
    } catch (error) {
      alert("Status update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      setLoading(true);
      await projectService.deleteProject(id);
      fetchProjects();
    } catch (error) {
      alert("Delete failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = useMemo(
    () => formData.projectContent.find((s) => s.id === selectedSubjectId) || null,
    [formData.projectContent, selectedSubjectId],
  );
  const addSubject = () => {
    const title = newSubjectTitle.trim();
    if (!title) return;
    const id = mkId('sub');
    setFormData((prev) => ({
      ...prev,
      projectContent: [...prev.projectContent, { id, title, details: '', chapters: [] }],
    }));
    setSelectedSubjectId(id);
    setNewSubjectTitle('');
  };

  const removeSubject = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      projectContent: prev.projectContent.filter((s) => s.id !== subjectId),
    }));
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId('');
    }
  };

  const updateSubjectDetails = (details) => {
    if (!selectedSubjectId) return;
    setFormData((prev) => ({
      ...prev,
      projectContent: prev.projectContent.map((s) =>
        s.id === selectedSubjectId ? { ...s, details } : s,
      ),
      fullDescription: details,
    }));
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-500 mt-1">Manage text-based practical projects for students.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search projects..." className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl outline-none focus:border-brand-blue text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && projects.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject Mode</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project) => (
                  (() => {
                    const summary = firstContentSummary(project);
                    return (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{project.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 font-semibold">{summary.subject}</div>
                      <div className="text-xs text-gray-500">{summary.chapter}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-md">{project.shortDescription}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        project.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => handleToggleStatus(project)}
                        className={`p-2 rounded-lg transition-colors inline-block ${
                          project.isActive ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={project.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {project.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(project)}
                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors inline-block"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue font-bold text-lg" 
                    placeholder="Enter bold project title" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                    placeholder="Brief 1-line overview for the list" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Theme Color</label>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="color"
                      value={formData.themeColor || '#C8A951'}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="h-10 w-16 rounded-lg border border-gray-200 bg-white cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.themeColor || '#C8A951'}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="#C8A951"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_THEME_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, themeColor: c })}
                        className={`h-7 w-7 rounded-full border-2 ${String(formData.themeColor || '').toLowerCase() === c.toLowerCase() ? 'border-gray-900' : 'border-white'}`}
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <label className="block text-sm font-bold text-gray-700">Project Content Structure (Subject + Description)</label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubjectTitle}
                      onChange={(e) => setNewSubjectTitle(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-brand-blue"
                      placeholder="Add subject/category (e.g. AI)"
                    />
                    <button type="button" onClick={addSubject} className="px-3 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold">Add Subject</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.projectContent.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(s.id);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                          selectedSubjectId === s.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {s.title}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSubject(s.id);
                          }}
                          className="ml-2 inline-block text-[11px] opacity-80"
                        >
                          ✕
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedSubject ? (
                    <div className="space-y-3 bg-white border border-gray-100 rounded-lg p-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject Details ({selectedSubject.title})</label>
                        <textarea
                          rows="8"
                          value={selectedSubject?.details || ''}
                          onChange={(e) => updateSubjectDetails(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-brand-blue resize-none"
                          placeholder="Subject details yahan direct likhiye."
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Add/select a subject to add direct details.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Intro / Overview (optional)</label>
                  <textarea 
                    rows="8" 
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({...formData, fullDescription: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue resize-none" 
                    placeholder="Optional general intro. Detailed content should be filled subject-wise below."
                  ></textarea>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Show this project to students</label>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">Target Courses (Who can see this?)</label>
                  <p className="text-xs text-gray-500">Only students enrolled in selected courses will see this project. Select none to hide from everyone.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    {courses.map(course => (
                      <label key={course.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <input 
                          type="checkbox"
                          checked={formData.allowedCourses.includes(course.id)}
                          onChange={(e) => {
                            const newAllowed = e.target.checked 
                              ? [...formData.allowedCourses, course.id]
                              : formData.allowedCourses.filter(id => id !== course.id);
                            setFormData({...formData, allowedCourses: newAllowed});
                          }}
                          className="w-4 h-4 text-brand-blue rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 truncate">{course.title}</span>
                      </label>
                    ))}
                    {courses.length === 0 && <p className="text-sm text-gray-400 col-span-2 text-center py-4">No courses available. Add courses first.</p>}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button 
                form="project-form"
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
