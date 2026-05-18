import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ShieldCheck, Layers, Video, Smartphone, Users, Award, 
  Phone, ArrowRight, Lock, Menu, X, ExternalLink, Star, CheckCircle2, 
  MessageSquare, ChevronRight, Play, Laptop, HelpCircle, Activity, 
  MapPin, Mail, MessageCircle, Send, Check
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { projectService } from '../services/projectService';
import { getAdminUrl } from '../utils/subdomain';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // Scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Fetch dynamic data
    loadCourses();
    loadProjects();
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await courseService.getAllCourses();
      // Filter out only active courses for public website
      const activeCourses = data.filter(c => c.isActive !== false);
      setCourses(activeCourses);
    } catch (error) {
      console.error("Error loading courses for landing page:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectService.getAllProjects();
      // Filter out only active projects
      const activeProjects = data.filter(p => p.isActive !== false);
      setProjects(activeProjects);
    } catch (error) {
      console.error("Error loading projects for landing page:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fallback Courses if Firestore is empty
  const fallbackCourses = [
    {
      id: 'fallback-os',
      title: 'Operating System',
      shortDescription: 'Core concepts of process, memory, scheduling and file management tailored for diploma academics.',
      category: 'Computer',
      level: 'Intermediate',
      duration: '45 Hours',
      price: '₹5,999',
      subjects: [{ title: 'Process Management' }, { title: 'Memory Management' }, { title: 'Scheduling Algorithms' }, { title: 'File Systems' }, { title: 'Deadlock Handling' }],
      thumbnailUrl: ''
    },
    {
      id: 'fallback-aiml',
      title: 'AI & ML Algorithm',
      shortDescription: 'Hands-on introduction to machine learning models, classifications, regressions, and deep learning basics.',
      category: 'Artificial Intelligence',
      level: 'Advanced',
      duration: '60 Hours',
      price: '₹7,999',
      subjects: [{ title: 'Supervised Learning' }, { title: 'Unsupervised Learning' }, { title: 'Classification Algorithms' }, { title: 'Regression Algorithms' }, { title: 'Deep Learning Basics' }],
      thumbnailUrl: ''
    },
    {
      id: 'fallback-cloudml',
      title: 'Cloud Computing for ML',
      shortDescription: 'Deploy scalable AI infrastructures, virtual machines, and cloud storage systems for production models.',
      category: 'Cloud Computing',
      level: 'Advanced',
      duration: '50 Hours',
      price: '₹6,999',
      subjects: [{ title: 'Cloud Fundamentals' }, { title: 'ML Deployment on Cloud' }, { title: 'Cloud Storage' }, { title: 'Virtual Machines' }, { title: 'Scalable AI Infrastructure' }],
      thumbnailUrl: ''
    }
  ];

  // Fallback Projects if Firestore is empty
  const fallbackProjects = [
    {
      id: 'proj-1',
      title: 'AI-Powered Smart Attendee',
      shortDescription: 'Facial recognition based smart attendance tracker for colleges.',
      domain: 'AI Projects',
      overview: 'A high-performance security and registration platform using OpenCV and Python. It securely registers student faces, verifies identity within 200ms, and updates attendance logs in real time.',
      themeColor: '#C8A951'
    },
    {
      id: 'proj-2',
      title: 'Customer Churn Predictor',
      shortDescription: 'ML model predicting subscriber churn rates with high precision.',
      domain: 'Machine Learning Projects',
      overview: 'Using Scikit-learn, Pandas, and XGBoost, this project implements a predictive pipeline analyzing student engagement rates to proactively signal students who require extra mentorship support.',
      themeColor: '#0B2C5F'
    },
    {
      id: 'proj-3',
      title: 'Scalable Image Classification Pipeline',
      shortDescription: 'Cloud-native ML deployment pipeline on AWS/Azure.',
      domain: 'Cloud Computing Projects',
      overview: 'Deploys an image recognition model as a microservice using Docker, Kubernetes, and AWS SageMaker, scaling dynamically to handle thousands of requests per second.',
      themeColor: '#0284c7'
    },
    {
      id: 'proj-4',
      title: 'Custom Shell & File Manager',
      shortDescription: 'C-based terminal interface mimicking Unix process environments.',
      domain: 'Operating System Projects',
      overview: 'A deep-level academic project implementing process scheduling, custom shell execution, thread forks, memory partition simulation, and deadlock resolution algorithms.',
      themeColor: '#7C3AED'
    }
  ];

  const displayedCourses = courses.length > 0 ? courses : fallbackCourses;
  const displayedProjects = projects.length > 0 ? projects : fallbackProjects;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-blue selection:text-white overflow-x-hidden">
      
      {/* 1. HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-morphism border-b border-white/20 bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="w-11 h-11 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-md shadow-brand-blue/10 border border-slate-100 p-1 shrink-0">
                <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain scale-[1.02]" />
              </div>
              <div className="ml-3">
                <span className="block font-black text-xl text-[#0B2C5F] tracking-tight leading-none font-['Outfit']">NEXTSTEP</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 leading-none">Academy</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 lg:space-x-2">
              {['home', 'about', 'courses', 'projects', 'mobile-app', 'security', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold capitalize transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-[#0B2C5F] text-white shadow-sm' 
                      : 'text-slate-600 hover:text-[#0B2C5F] hover:bg-slate-100/80'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a 
                href={getAdminUrl()}
                className="flex items-center gap-1.5 px-4 py-2 border-2 border-brand-blue/15 text-brand-blue hover:bg-brand-blue/5 text-sm font-bold rounded-xl transition-all"
              >
                <Lock size={14} />
                <span>Admin Login</span>
              </a>
              <button 
                onClick={() => scrollToSection('courses')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
              >
                Start Learning
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <a 
                href={getAdminUrl()} 
                className="p-2 text-brand-blue bg-brand-blue/5 rounded-lg"
                title="Admin Login"
              >
                <Lock size={18} />
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-brand-blue rounded-lg bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-slate-100 bg-white shadow-inner"
            >
              <div className="px-4 py-4 space-y-1.5">
                {['home', 'about', 'courses', 'projects', 'mobile-app', 'security', 'contact'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                      activeTab === tab 
                        ? 'bg-brand-blue text-white' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <a 
                    href={getAdminUrl()}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-brand-blue/20 text-brand-blue font-bold rounded-xl bg-slate-50"
                  >
                    <Lock size={15} />
                    <span>Admin Panel Access</span>
                  </a>
                  <button 
                    onClick={() => scrollToSection('courses')}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    Start Learning Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-gradient-to-b from-blue-900/10 via-white to-white overflow-hidden">
        {/* Background Decorative Rings/Glows */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-br from-blue-400/15 via-[#C8A951]/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#0B2C5F]/10 border border-[#0B2C5F]/20 text-[#0B2C5F] px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Diploma Students Focus Platform
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#0B2C5F] font-['Outfit'] leading-tight">
                NEXTSTEP <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">Academy</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-bold text-slate-600 leading-snug max-w-2xl mx-auto lg:mx-0">
                “One Step Always Forward”
              </p>
              
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                A highly secure, robust, and modern digital e-learning platform specially designed to empower diploma students with advanced concepts in Operating Systems, Machine Learning, and Cloud Infrastructures.
              </p>

              {/* Highlights badges */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 pt-2">
                {[
                  { icon: BookOpen, text: 'Industry-Focused Courses' },
                  { icon: Smartphone, text: 'Mobile-Friendly Learning' },
                  { icon: ShieldCheck, text: 'Secure Access System' },
                  { icon: Award, text: 'Learn Anytime, Anywhere' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <item.icon className="text-amber-500 shrink-0" size={18} />
                    <span className="text-[13px] font-bold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => scrollToSection('courses')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-blue to-blue-800 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  Explore Our Courses
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-slate-200 hover:border-brand-blue/30 text-slate-700 font-extrabold text-base rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  Contact Admin Support
                </button>
              </div>
            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[36px] bg-gradient-to-tr from-[#0B2C5F] to-indigo-900 shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
                
                {/* Decorative particles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Dashboard Widget Interface */}
                <div className="space-y-4 z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <Award className="text-amber-400" size={16} />
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase tracking-widest font-bold">LATEST BATCH</span>
                        <span className="block text-xs font-bold text-white leading-none">Diploma Special AI/ML</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/30">Live Now</span>
                  </div>

                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold text-sky-300">CURRICULUM INCLUDES</span>
                      <span className="text-[11px] text-white/70 font-semibold">100% Practical</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-tight">Secure Linux Shell Execution & Classification Algorithms</p>
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-amber-400 h-full w-[85%] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Simulated App Stream Widget */}
                <div className="bg-white rounded-2xl p-4 shadow-xl z-10 border border-slate-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30 shrink-0 text-white font-bold">
                    <Play fill="white" size={18} className="ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SECURE STREAM</span>
                    <span className="block font-bold text-slate-800 truncate text-sm">OS Process Scheduling.mp4</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <ShieldCheck size={12} />
                      No-Download Active Shield
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. ABOUT US & GOALS */}
      <section id="about" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Platform Overview</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">About NEXTSTEP Academy</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-medium text-base pt-2">
              NEXTSTEP Academy is an advanced digital learning platform created specifically to help diploma students build strong technical and practical skills in modern technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Box: Focus points */}
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold text-brand-blue font-['Outfit']">Our Platform Focus</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                We believe in standardizing technical education. Instead of focusing only on written theory, our syllabus is strictly designed around building and deploying projects in modern digital architectures.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'High-Quality Video Lectures', desc: 'Detailed modules recorded by specialized engineers explaining underlying concepts.' },
                  { title: 'Practical Project-Based Learning', desc: 'Develop real applications in Operating Systems, ML models, and Cloud deployments.' },
                  { title: 'Notes & Expert Study Material', desc: 'Quick reference cheat sheets, topic outlines, and detailed examination guides.' },
                  { title: 'Live Online Classes', desc: 'Direct live sessions to interact, resolve doubts, and code alongside experienced mentors.' },
                  { title: 'AI & Highly Technical Specializations', desc: 'Step-by-step algorithms designed cleanly to build student expertise.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} className="text-amber-600 font-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Vision, Mission & Goals cards */}
            <div className="grid grid-cols-1 gap-6">
              {/* Mission Card */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-premium flex items-start gap-4 hover:border-[#0B2C5F]/20 hover:bg-[#0B2C5F]/5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600">
                  <Layers size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xl text-brand-blue font-['Outfit']">Our Mission</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 font-bold list-disc pl-4">
                    <li>Deliver quality technical education</li>
                    <li>Help students become industry-ready</li>
                    <li>Promote practical coding models</li>
                    <li>Support innovation & creativity</li>
                    <li>Mentorship through projects</li>
                  </ul>
                </div>
              </div>

              {/* Vision Card */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-premium flex items-start gap-4 hover:border-[#0B2C5F]/20 hover:bg-[#0B2C5F]/5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0 text-sky-600">
                  <Award size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xl text-brand-blue font-['Outfit']">Our Vision</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    To become a leading digital education platform that empowers diploma students with modern technology skills and practical knowledge for successful, high-paying engineering careers.
                  </p>
                </div>
              </div>

              {/* Goal Highlight */}
              <div className="p-6 rounded-3xl bg-brand-blue text-white shadow-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block mb-1">Affordable & Secure</span>
                  <p className="font-bold text-sm leading-snug">Provide high-quality and premium digital learning through a simple, robust and secure e-learning container.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-amber-400">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Excellence Guaranteed</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Why Choose NEXTSTEP Academy?</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-medium text-sm pt-2">
              Our e-learning infrastructure is custom-built with multiple core advantages specifically aligned for competitive diploma syllabi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Secure Learning Platform', desc: 'Ultimate streaming protection prevent unauthorized downloads or credential sharing.' },
              { icon: Smartphone, title: 'Mobile-Friendly Access', desc: 'Fully optimized layouts render beautifully on smartphones for learning on the go.' },
              { icon: Video, title: 'Live Interactive Classes', desc: 'Direct live streams with expert instructors so you can debug and ask questions dynamically.' },
              { icon: Award, title: 'AI & Technology Focused', desc: 'Curriculum designed strictly on modern algorithms, machine learning model layers and shell programming.' },
              { icon: Layers, title: 'Project-Based Learning', desc: 'Every topic is bundled with a practical code assignment to translate theory into working skills.' },
              { icon: Laptop, title: 'Simple & Modern UI', desc: 'Premium, clean interface with lightning-fast speeds ensures zero friction during studying.' },
              { icon: Users, title: 'Expert Mentor Guidance', desc: 'One-on-one reviews and project oversight to ensure you code cleanly with industry best practices.' },
              { icon: BookOpen, title: 'Notes & Study Materials', desc: 'Structured PDF guides, scheduling matrices, and exam reference blueprints.' },
              { icon: Activity, title: 'Student Progress Tracking', desc: 'Real-time dashboard displays completed lectures, test schedules, and overall analytics.' }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 hover:scale-[1.01] transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0B2C5F] shrink-0 border border-slate-100 group-hover:bg-brand-blue">
                  <benefit.icon size={20} className="text-brand-blue" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">{benefit.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. COURSES SECTION */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Academics</span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Featured Academic Batches</h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full" />
              <p className="text-slate-500 font-semibold text-sm max-w-xl">
                Explore our dynamic curriculum, loaded in real-time by the academy administrator. Select any course to preview subject lists.
              </p>
            </div>
            {courses.length > 0 && (
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 self-start md:self-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Connected Live to Backend Database
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCourses.map((course) => {
              // Ensure we normalize subjects if format differs
              const subjectsList = course.subjects || [];
              const price = course.price ? (String(course.price).includes('₹') ? course.price : `₹${course.price}`) : '₹5,999';
              
              return (
                <div 
                  key={course.id} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 card-hover flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Thumbnail / Header Area */}
                  <div className="relative h-48 bg-gradient-to-br from-[#0B2C5F] via-[#153e77] to-indigo-950 p-6 flex flex-col justify-between text-white overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px]" />
                    )}

                    <div className="flex justify-between items-start z-10">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-[10px] uppercase font-black tracking-widest text-amber-300 border border-white/10">
                        {course.category || 'Engineering'}
                      </span>
                      <span className="text-white/80 font-bold text-xs uppercase tracking-wider">
                        {course.duration || 'Semester'}
                      </span>
                    </div>

                    <div className="space-y-1.5 z-10">
                      <h3 className="font-extrabold text-xl sm:text-2xl font-['Outfit'] leading-tight drop-shadow-md">
                        {course.title}
                      </h3>
                      <p className="text-white/80 font-semibold text-xs truncate max-w-xs drop-shadow">
                        {course.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Body Syllabus Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Syllabus Highlights</span>
                        <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md">
                          {course.level || 'Diploma Core'}
                        </span>
                      </div>

                      {/* Subject lists */}
                      <div className="space-y-2 mb-6">
                        {subjectsList.slice(0, 5).map((subject, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{subject.title || subject}</span>
                          </div>
                        ))}
                        {subjectsList.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No topics detailed yet.</p>
                        )}
                        {subjectsList.length > 5 && (
                          <span className="text-[10px] text-[#0B2C5F] font-bold">+ {subjectsList.length - 5} more detailed sub-modules</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pricing & Drawer Trigger */}
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">FULL BATCH FEE</span>
                          <span className="text-lg font-black text-emerald-600 leading-none">{price}</span>
                        </div>
                        <span className="text-slate-400 text-xs font-bold">Inclusive of Study Material</span>
                      </div>

                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#0B2C5F] hover:border-brand-blue transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Batch Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. PROJECTS SECTION */}
      <section id="projects" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Exhibits</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Student Coding Projects</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              Browse professional-grade case studies and software projects our diploma students build and deploy in active classes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Visual Accent bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2" 
                  style={{ backgroundColor: project.themeColor || '#C8A951' }} 
                />

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border"
                      style={{ 
                        color: project.themeColor || '#C8A951',
                        borderColor: `${project.themeColor || '#C8A951'}30`,
                        backgroundColor: `${project.themeColor || '#C8A951'}10`
                      }}
                    >
                      {project.domain || 'Software'}
                    </span>
                    <Layers size={14} className="text-slate-400" />
                  </div>

                  <h3 className="font-extrabold text-base text-slate-800 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                    {project.shortDescription || project.overview}
                  </p>
                </div>

                <div className="border-t border-slate-50 mt-6 pt-4">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                    style={{ color: project.themeColor || '#0B2C5F' }}
                  >
                    <span>View Specifications</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. MOBILE APP SECTION */}
      <section id="mobile-app" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Graphics (Beautiful Simulated Smartphone Screen) */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1 relative">
              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
              
              {/* iPhone Container */}
              <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 overflow-hidden ring-4 ring-slate-700/20 z-10 shrink-0">
                
                {/* Speaker Grill / Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-800 rounded-full mb-1" />
                </div>

                {/* Internal App Screen */}
                <div className="h-full w-full bg-[#081b37] rounded-[40px] p-4 pt-8 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Header inside App */}
                  <div className="flex justify-between items-center z-10">
                    <div>
                      <span className="block text-[8px] text-white/50 uppercase tracking-widest font-black leading-none">STUDENT BATCH</span>
                      <span className="block text-xs font-black text-amber-400 leading-tight">Operating Systems</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                      <Users size={12} />
                    </div>
                  </div>

                  {/* Simulated App Content Body */}
                  <div className="my-auto space-y-4 z-10 py-6">
                    {/* OTP Shield Banner */}
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Security Shield Active</span>
                      </div>
                      <p className="text-[9px] text-white/80 leading-relaxed font-semibold">OTP Login based authentication mapped uniquely to your smartphone IMEI container.</p>
                    </div>

                    {/* Quick Lectures Lists inside App */}
                    <div className="space-y-2">
                      <span className="block text-[8px] uppercase tracking-wider text-white/40 font-black">Video Modules</span>
                      {[
                        { title: 'Lecture 1: Scheduling Alg.mp4', active: true },
                        { title: 'Lecture 2: Memory Allocation.mp4', active: false },
                        { title: 'Lecture 3: Deadlock Handler.mp4', active: false }
                      ].map((vid, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${vid.active ? 'bg-[#C8A951]/20 border-[#C8A951]/30' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0">
                              <Play size={10} className={vid.active ? 'text-amber-400' : 'text-white/60'} />
                            </div>
                            <span className="text-[10px] font-bold truncate text-white/95">{vid.title}</span>
                          </div>
                          {vid.active ? <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded">Stream</span> : <Lock size={10} className="text-white/30 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Tab bar inside App */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex justify-between items-center z-10">
                    {['Home', 'Notes', 'Live', 'Profile'].map((tb, idx) => (
                      <span key={tb} className={`text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${idx === 0 ? 'bg-amber-400 text-slate-900' : 'text-white/70'}`}>
                        {tb}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            </div>

            {/* Right Information Details */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Modern Ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Learn Anywhere with NEXTSTEP Academy App</h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full" />
              
              <p className="text-slate-600 leading-relaxed font-semibold text-base">
                Enjoy study freedom. Our proprietary smartphone application (APK/Bundle) provides seamless offline and secure digital viewing mapped precisely to your curriculum requirements.
              </p>

              {/* Grid lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* App features */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                    <Smartphone className="text-brand-blue" size={18} />
                    App Features
                  </h3>
                  <ul className="space-y-2 text-slate-500 text-xs font-bold pl-1">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Secure login with OTP Verification</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Instant video lecture streaming</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Built-in high speed PDF Reader</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Real-time administrative notifications</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Automated student learning tracker</li>
                  </ul>
                </div>

                {/* App security features */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                    <ShieldCheck className="text-amber-500" size={18} />
                    Enterprise Security Shield
                  </h3>
                  <ul className="space-y-2 text-slate-500 text-xs font-bold pl-1">
                    <li className="flex items-center gap-2"><Lock size={14} className="text-amber-500" /> No Video Downloads allowed locally</li>
                    <li className="flex items-center gap-2"><Lock size={14} className="text-amber-500" /> Hard screenshot blocker</li>
                    <li className="flex items-center gap-2"><Lock size={14} className="text-amber-500" /> Secure encrypted HLS video streams</li>
                    <li className="flex items-center gap-2"><Lock size={14} className="text-amber-500" /> Admin-authorized active sessions</li>
                    <li className="flex items-center gap-2"><Lock size={14} className="text-amber-500" /> Hard screen-recording blocking shield</li>
                  </ul>
                </div>
              </div>

              {/* Call out */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-3 items-center">
                <span className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 font-extrabold text-lg">!</span>
                <p className="text-amber-800 font-bold text-xs">Note: App access details are assigned uniquely to authenticated students by the administrator.</p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. LIVE CLASSES SECTION */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Real-Time Learning</span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Interactive Live Classes</h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full" />
              
              <p className="text-slate-600 leading-relaxed font-semibold text-base">
                Bridge the digital gap. Our interactive live stream system helps students connect directly with industry engineering mentors in scheduled video forums.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Join Live Classes Easily', desc: 'Single tap access to integrated live stream feeds, directly from the student dashboard.' },
                  { title: 'Interact & Code in Real Time', desc: 'Share your screens, debug complex code blocks, and ask instant questions during lectures.' },
                  { title: 'Direct Access to Meeting Links', desc: 'Secure Google Meet/Zoom integrations structured cleanly in class schedules.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-brand-blue">
                      <Video size={14} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 w-full max-w-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Scheduled Feed</span>
                  </div>
                  <span className="text-xs font-bold text-[#0B2C5F]">Today, 7:30 PM</span>
                </div>

                <div className="aspect-video rounded-2xl bg-slate-950 flex items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/30 to-transparent pointer-events-none" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[8px] uppercase tracking-widest z-10 flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live Connection
                  </div>

                  <Video size={36} className="text-white/40 animate-pulse" />
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">Advanced Deep Learning Neural Networks</h4>
                  <p className="text-xs text-slate-500 font-medium">Instructor: Prof. Nitin Sinha & Tech Mentors</p>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => scrollToSection('courses')}
                      className="flex-1 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold shadow hover:bg-brand-blue/95 transition-all text-center"
                    >
                      Join Class Room
                    </button>
                    <button className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Syllabus</button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. SECURITY CORE SHIELD SECTION */}
      <section id="security" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Shield System</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Secure Learning Environment</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              Our industry-grade protection framework is engineered directly to guard resources, prevent copycat activity, and assure verified students of the highest content integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'OTP Authentication Shield', desc: 'Secure verification binds student identity uniquely to a single mobile container.' },
              { icon: Lock, title: 'Secure Video HLS Streaming', desc: 'Encrypted segment parsing prevents screen scraping tools or raw video URL scraping.' },
              { icon: Laptop, title: 'Session Log-Based Control', desc: 'Allows active login instances on only one browser or mobile dashboard at a time.' },
              { icon: Smartphone, title: 'Screen Recording Blockers', desc: 'Smart background process checks automatically exit when screen capture software is run.' },
              { icon: Lock, title: 'Screenshot Capture Block', desc: 'Underlying Capacitor components block device keys to safeguard text notes and diagrams.' },
              { icon: ShieldCheck, title: 'Content Access Shield', desc: 'Granular admin dashboard oversight allows instantaneous session termination and security reviews.' }
            ].map((shield, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <shield.icon size={24} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{shield.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">{shield.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 tracking-wider pt-6">
                  <ShieldCheck size={12} />
                  <span>Fully Integrated</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. SYSTEM TOUR / FEATURES OVERVIEW */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Inside the Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Robust Digital Infrastructure</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              A comprehensive system mapping out a highly functional panel for academy administrators and simple study logs for enrolled students.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Admin Panel Card */}
            <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-premium flex flex-col justify-between hover:border-[#0B2C5F]/20 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shrink-0">
                      <Laptop size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 leading-tight">Powerful Admin Panel</h3>
                      <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Console Overview</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider">Control Hub</span>
                </div>

                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Our comprehensive backend dashboard gives administrators high-grain authority over all student activity, coursework assets, and notification calendars.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'Dynamic Student Management',
                    'Real-Time Course Curriculums',
                    'Lecture Upload Pipeline',
                    'PDF Notes & Study Files Library',
                    'Live Class Scheduler',
                    'FCM Push Notification Hub',
                    'Public Case Studies / Projects Hub'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 mt-8 pt-5">
                <a 
                  href={getAdminUrl()}
                  className="w-full py-3 bg-[#0B2C5F] text-white hover:bg-slate-900 rounded-2xl font-bold text-xs uppercase tracking-wider text-center block transition-all shadow-md shadow-brand-blue/15"
                >
                  Access Admin Panel console
                </a>
              </div>
            </div>

            {/* Student Dashboard Card */}
            <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-premium flex flex-col justify-between hover:border-[#0B2C5F]/20 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 leading-tight">Student Dashboard</h3>
                      <span className="text-[10px] text-brand-blue font-bold tracking-widest uppercase">Learning Hub</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-100 text-brand-blue text-[9px] font-black uppercase tracking-wider">Mobile Web</span>
                </div>

                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Students log in cleanly using safe OTP pipelines to access authorized syllabus files, play lectures, download curriculum documents, and view notification cards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'Instant OTP Enrollment Access',
                    'Resume Studying Logs',
                    'Course Progression Metrics',
                    'Comprehensive Lectures Video List',
                    'Syllabus PDF Study Material',
                    'Mentorship Live Meeting Links',
                    'Broadcast Notification cards'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 mt-8 pt-5">
                <button 
                  onClick={() => scrollToSection('courses')}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-blue hover:text-brand-blue rounded-2xl font-bold text-xs uppercase tracking-wider text-center block transition-all"
                >
                  Start Student Journey
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11. TESTIMONIALS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Endorsements</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Diploma Student Reviews</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              Read how our dedicated e-learning focus helps diploma candidates boost technical competence and secure exceptional career opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { review: "“NEXTSTEP Academy helped me understand AI and ML algorithms in a very simple, direct way. The project reviews made me highly confident.”", author: "Diploma Student", course: "AI & ML Algorithm Batch" },
              { review: "“The live interactive sessions and step-by-step project blueprints greatly improved my practical engineering skills. The dashboard speeds are excellent.”", author: "IT Student", course: "Cloud Deployment Batch" },
              { review: "“Best secure learning platform designed cleanly for diploma engineers. Highly recommend to all students seeking actual software skills.”", author: "Computer Engineering Student", course: "Operating Systems Batch" }
            ].map((review, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-bold italic">{review.review}</p>
                </div>
                
                <div className="border-t border-slate-100 mt-6 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B2C5F] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    {review.author[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{review.author}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{review.course}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. CONTACT US SECTION */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Get In Touch</span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Contact Our Support</h2>
              <div className="w-16 h-1 bg-amber-500 rounded-full" />
              
              <p className="text-slate-600 leading-relaxed font-medium text-sm">
                Have questions about academic batches, app login credentials, or enrollment plans? Direct support is standing by to help you immediately.
              </p>

              <div className="space-y-4 pt-4">
                
                {/* Mobile call */}
                <a 
                  href="tel:9168482314"
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-[#0B2C5F]/20 hover:scale-[1.01] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Call support</span>
                    <span className="block font-black text-slate-800 text-base leading-none">9168482314</span>
                  </div>
                </a>

                {/* WhatsApp Support */}
                <a 
                  href="https://wa.me/919168482314?text=Hi%20NEXTSTEP%20Academy,%20I%20want%20to%20know%20more%20about%20your%20courses."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-500/20 hover:scale-[1.01] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Chat on WhatsApp</span>
                    <span className="block font-black text-slate-800 text-base leading-none">Start WhatsApp Chat</span>
                  </div>
                </a>

                {/* Info alert */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-3 text-xs text-amber-800 font-bold leading-relaxed">
                  <HelpCircle size={18} className="shrink-0 text-amber-600" />
                  <p>Inquiries will be responded to within 1-2 hours. Student registration configurations must be finalized by administrators in active console sessions.</p>
                </div>

              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-100 shadow-premium relative overflow-hidden">
              
              <h3 className="font-extrabold text-xl text-brand-blue mb-2 font-['Outfit']">Send a Message</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">Fill out the fast form below to request syllabus briefs or general platform queries.</p>

              {formSubmitted ? (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-100">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-extrabold text-2xl text-slate-900">Message Received!</h3>
                  <p className="text-slate-500 text-sm max-w-sm">Thank you for contacting NEXTSTEP Academy. Our support representative will contact you shortly.</p>
                </div>
              ) : null}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm"
                      placeholder="e.g. john@student.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Subject / Query Topic</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm"
                    placeholder="e.g. Admission in AI & ML batch"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Detail Message</label>
                  <textarea 
                    rows="4" 
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm resize-none"
                    placeholder="Describe your request in detail..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#0B2C5F] text-white hover:bg-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Send size={14} />
                  <span>Send Message Now</span>
                </button>
              </form>

            </div>

          </div>

        </div>
      </section>

      {/* 13. FOOTER SECTION */}
      <footer className="bg-slate-900 text-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            
            {/* Brand details */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 p-1">
                  <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="ml-3">
                  <span className="block font-black text-lg tracking-tight leading-none">NEXTSTEP</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 leading-none">Academy</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                “One Step Always Forward”
              </p>
              
              <p className="text-slate-400 text-xs leading-relaxed">
                Modern & Secure E-Learning Platform specially designed for Diploma Students in advanced software domains.
              </p>
            </div>

            {/* Courses links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-amber-400">Featured Courses</h4>
              <ul className="space-y-2 text-slate-400 text-xs font-semibold">
                <li><button onClick={() => scrollToSection('courses')} className="hover:text-amber-400 transition-colors block text-left">Operating System</button></li>
                <li><button onClick={() => scrollToSection('courses')} className="hover:text-amber-400 transition-colors block text-left">AI & ML Algorithm</button></li>
                <li><button onClick={() => scrollToSection('courses')} className="hover:text-amber-400 transition-colors block text-left">Cloud Computing for ML</button></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-amber-400">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-xs font-semibold">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-amber-400 transition-colors block text-left">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-amber-400 transition-colors block text-left">About Us</button></li>
                <li><button onClick={() => scrollToSection('courses')} className="hover:text-amber-400 transition-colors block text-left">Courses</button></li>
                <li><button onClick={() => scrollToSection('projects')} className="hover:text-amber-400 transition-colors block text-left">Student Projects</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-amber-400 transition-colors block text-left">Contact Us</button></li>
              </ul>
            </div>

            {/* Contact numbers */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-amber-400">Support Desk</h4>
              <div className="space-y-2 text-slate-400 text-xs font-semibold">
                <a href="tel:9168482314" className="hover:text-amber-400 flex items-center gap-2">
                  <Phone size={14} className="text-amber-400" />
                  <span>Call support: 9168482314</span>
                </a>
                <span className="block text-[10px] text-slate-500 leading-relaxed font-bold">
                  NEXTSTEP Academy - Empowering Diploma Students with Technology & Innovation
                </span>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} NEXTSTEP Academy. All rights reserved.</span>
            <div className="flex gap-4">
              <a href={getAdminUrl()} className="hover:text-amber-400 transition-colors font-bold">Admin Dashboard Panel</a>
              <span className="text-slate-800">|</span>
              <span className="font-bold text-amber-500">One Step Always Forward</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 14. COURSE DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 bg-slate-950/60 z-[100] flex items-center justify-end p-0 sm:p-4 backdrop-blur-sm">
            {/* Backdrop click exits */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedCourse(null)} />

            {/* Card Content Drawer */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-white h-full sm:h-[95vh] w-full max-w-lg shadow-2xl relative z-10 flex flex-col justify-between sm:rounded-3xl overflow-hidden"
            >
              {/* Header block with color */}
              <div className="p-6 bg-gradient-to-br from-[#0B2C5F] to-slate-900 text-white shrink-0 relative">
                <button 
                  onClick={() => setSelectedCourse(null)} 
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
                
                <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[10px] uppercase font-black tracking-widest text-amber-300 border border-white/10 inline-block mb-3">
                  {selectedCourse.category || 'Curriculum'}
                </span>

                <h3 className="font-black text-2xl font-['Outfit'] tracking-tight leading-snug pr-8">
                  {selectedCourse.title}
                </h3>
              </div>

              {/* Scrollable details */}
              <div className="overflow-y-auto p-6 flex-1 space-y-6 custom-scrollbar text-sm">
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest text-slate-400">Core Brief</h4>
                  <p className="text-slate-600 font-semibold leading-relaxed">
                    {selectedCourse.shortDescription}
                  </p>
                  {selectedCourse.fullDescription && (
                    <p className="text-slate-500 font-medium leading-relaxed pt-2">
                      {selectedCourse.fullDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Duration</span>
                    <span className="font-extrabold text-slate-800">{selectedCourse.duration || 'Flexible'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Level Target</span>
                    <span className="font-extrabold text-slate-800">{selectedCourse.level || 'Diploma core'}</span>
                  </div>
                </div>

                {/* Syllabus Modules */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest text-slate-400">Full Subject Modules</h4>
                  <div className="space-y-2.5">
                    {(selectedCourse.subjects || []).map((sub, sIdx) => (
                      <div key={sIdx} className="flex gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100 hover:border-brand-blue/10 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-[#0B2C5F]/10 text-brand-blue flex items-center justify-center shrink-0 font-extrabold text-xs">
                          {sIdx + 1}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm">{sub.title || sub}</h5>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Syllabus verified</span>
                        </div>
                      </div>
                    ))}
                    {(selectedCourse.subjects || []).length === 0 && (
                      <p className="text-slate-400 italic">No topics detailed yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom booking */}
              <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Academics Batch Fee</span>
                    <span className="text-xl font-black text-emerald-600 leading-none">
                      {selectedCourse.price ? (String(selectedCourse.price).includes('₹') ? selectedCourse.price : `₹${selectedCourse.price}`) : '₹5,999'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">Registration active</span>
                </div>

                <a 
                  href={`https://wa.me/919168482314?text=Hi%20NEXTSTEP%20Academy,%20I%20am%20interested%20in%20joining%20the%20${encodeURIComponent(selectedCourse.title)}%20batch.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-[#0B2C5F] text-white hover:bg-slate-900 text-center font-bold text-xs uppercase tracking-wider rounded-2xl block transition-all shadow"
                >
                  Book Enrollment Seat on WhatsApp
                </a>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 15. PROJECT DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-950/60 z-[100] flex items-center justify-end p-0 sm:p-4 backdrop-blur-sm">
            {/* Backdrop click exits */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedProject(null)} />

            {/* Card Content Drawer */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-white h-full sm:h-[95vh] w-full max-w-lg shadow-2xl relative z-10 flex flex-col justify-between sm:rounded-3xl overflow-hidden"
            >
              {/* Header block with themeColor */}
              <div 
                className="p-6 text-white shrink-0 relative"
                style={{ backgroundColor: selectedProject.themeColor || '#0B2C5F' }}
              >
                <button 
                  onClick={() => setSelectedProject(null)} 
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
                
                <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[10px] uppercase font-black tracking-widest text-amber-300 border border-white/10 inline-block mb-3">
                  {selectedProject.domain || 'Student Project'}
                </span>

                <h3 className="font-black text-2xl font-['Outfit'] tracking-tight leading-snug pr-8">
                  {selectedProject.title}
                </h3>
              </div>

              {/* Scrollable details */}
              <div className="overflow-y-auto p-6 flex-1 space-y-6 custom-scrollbar text-sm">
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest text-slate-400">Brief Overview</h4>
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    {selectedProject.shortDescription}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest text-slate-400">Full Specifications & Blueprints</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedProject.overview || 'No extended blueprint loaded.'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-3 text-xs text-amber-800 font-semibold leading-relaxed">
                  <Award size={18} className="shrink-0 text-amber-600" />
                  <p>Students deploy this full codebase structure to cloud containers in real time as a prerequisite for graduation credentials.</p>
                </div>

              </div>

              {/* Bottom close */}
              <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-full py-3.5 bg-slate-200 text-slate-700 hover:bg-slate-300 text-center font-bold text-xs uppercase tracking-wider rounded-2xl block transition-all"
                >
                  Close Specification
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
