import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Trash2, Loader2, Edit3, Globe, Phone, BookOpen, Layers } from 'lucide-react';
import { projectService } from '../services/projectService';

const defaultFormData = () => ({
  title: '',
  shortDescription: '',
  overview: '',
  domain: '',
  themeColor: '#C8A951',
  isActive: true,
});

const PROJECT_THEME_PRESETS = ['#C8A951', '#0B2C5F', '#2563EB', '#7C3AED', '#DC2626', '#059669', '#EA580C'];

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(defaultFormData());

  useEffect(() => {
    fetchProjects();
  }, []);

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
      setLoading(true);
      const payload = {
        ...formData,
      };
      
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
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      shortDescription: project.shortDescription || '',
      overview: project.overview || '',
      domain: project.domain || '',
      themeColor: project.themeColor || '#C8A951',
      isActive: project.isActive !== undefined ? project.isActive : true,
    });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-500 mt-1">Manage public projects and case studies for all students.</p>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{project.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{project.shortDescription}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">
                        <Layers size={12} />
                        {project.domain || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
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
                    placeholder="e.g. ChatGPT App, E-Commerce Site" 
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Category / Field</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={formData.domain}
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-brand-blue" 
                      placeholder="e.g. Artificial Intelligence / Web Development" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Overview / Full Details *</label>
                  <textarea 
                    rows="8" 
                    required
                    value={formData.overview}
                    onChange={(e) => setFormData({...formData, overview: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand-blue resize-none font-medium" 
                    placeholder="Detailed project explanation, overview, and requirements..."
                  ></textarea>
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
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Show this project to all students</label>
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
