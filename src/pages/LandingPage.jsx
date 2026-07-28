import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ShieldCheck, Layers, Video, Smartphone, Users, Award, 
  Phone, ArrowRight, Lock, Menu, X, ExternalLink, Star, CheckCircle2, 
  MessageSquare, ChevronRight, Play, Laptop, HelpCircle, Activity, 
  MapPin, Mail, MessageCircle, Send, Check, Loader2
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { projectService } from '../services/projectService';
import { reviewService } from '../services/reviewService';
import { admissionService } from '../services/admissionService';
import { teacherService } from '../services/teacherService';


const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', course: '', rating: 5, review: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Admission Form State
  const [admissionForm, setAdmissionForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [admissionSubmitted, setAdmissionSubmitted] = useState(false);
  const [submittingAdmission, setSubmittingAdmission] = useState(false);

  useEffect(() => {
    // Subscribe to Courses in real-time
    setLoadingCourses(true);
    const unsubscribeCourses = courseService.subscribeAllCourses(
      (data) => {
        const activeCourses = data.filter(c => c.isActive !== false);
        setCourses(activeCourses);
        setLoadingCourses(false);
      },
      (error) => {
        console.error("Error subscribing to courses:", error);
        setLoadingCourses(false);
      }
    );

    // Subscribe to Projects in real-time
    setLoadingProjects(true);
    const unsubscribeProjects = projectService.subscribeAllProjects(
      (data) => {
        const activeProjects = data.filter(p => p.isActive !== false);
        setProjects(activeProjects);
        setLoadingProjects(false);
      },
      (error) => {
        console.error("Error subscribing to projects:", error);
        setLoadingProjects(false);
      }
    );

    // Subscribe to Reviews in real-time
    setLoadingReviews(true);
    let unsubscribeReviews = null;
    const setupReviewSubscription = async () => {
      try {
        const unsub = await reviewService.subscribeApprovedReviews(
          (data) => {
            setReviews(data);
            setLoadingReviews(false);
          },
          (error) => {
            console.error("Error subscribing to reviews:", error);
            setLoadingReviews(false);
          }
        );
        unsubscribeReviews = unsub;
      } catch (err) {
        console.error("Error setting up reviews subscription:", err);
        setLoadingReviews(false);
      }
    };
    setupReviewSubscription();
    
    // Fetch Teachers once
    teacherService.getAllTeachers()
      .then(data => setTeachers(data))
      .catch(err => console.error('Error fetching teachers:', err));
    
    return () => {
      if (unsubscribeCourses) unsubscribeCourses();
      if (unsubscribeProjects) unsubscribeProjects();
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await reviewService.addReview({
        author: reviewForm.author,
        course: reviewForm.course,
        rating: Number(reviewForm.rating),
        review: reviewForm.review
      });
      setReviewSubmitted(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitted(false);
        setReviewForm({ author: '', course: '', rating: 5, review: '' });
      }, 3000);
    } catch (error) {
      alert("Failed to submit review: " + error.message);
    } finally {
      setSubmittingReview(false);
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

  const displayedCourses = courses.length > 0 ? courses : fallbackCourses;

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAdmission(true);
      await admissionService.addAdmissionRequest({
        name: admissionForm.name,
        email: admissionForm.email,
        phone: admissionForm.phone,
        course: admissionForm.course || (displayedCourses[0] ? displayedCourses[0].title : 'General Inquiry'),
        message: admissionForm.message
      });
      setAdmissionSubmitted(true);
      setTimeout(() => {
        setAdmissionSubmitted(false);
        setAdmissionForm({ name: '', email: '', phone: '', course: '', message: '' });
      }, 5000);
    } catch (error) {
      alert("Failed to submit admission request: " + error.message);
    } finally {
      setSubmittingAdmission(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    
    // Small timeout ensures the mobile menu closing animation starts before we scroll
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = window.innerWidth < 640 ? 64 : 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans selection:bg-brand-blue selection:text-white overflow-x-hidden">
      
      {/* 1. HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-morphism border-b border-white/20 bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="w-11 h-11 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-md shadow-brand-blue/10 border border-slate-100 p-1 shrink-0">
                <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain scale-[1.02]" />
              </div>
              <div className="ml-3">
                <span className="block font-black text-xl text-[#0B2C5F] tracking-tight leading-none font-['Outfit']">NEXTSTEP</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 leading-none">AI Solutions</span>
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
              <button 
                onClick={() => scrollToSection('courses')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
              >
                Start Learning
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
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
      <section id="home" className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-28 md:pb-28 bg-gradient-to-b from-blue-900/10 via-slate-100/30 to-transparent overflow-hidden">
        {/* Background Decorative Rings/Glows */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-br from-blue-400/15 via-[#C8A951]/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10 hidden sm:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-[#0B2C5F]/10 border border-[#0B2C5F]/20 text-[#0B2C5F] px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Diploma Students Focus Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#0B2C5F] font-['Outfit'] leading-tight">
                NEXTSTEP <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">AI Solutions</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-bold text-slate-600 leading-snug max-w-2xl mx-auto lg:mx-0">
                “Learn • Build • Innovate”
              </p>
              
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Transforming ideas into intelligent solutions. We are an innovative IT company and internship training center delivering advanced technology solutions, AI-driven development, and industry-oriented professional training.
              </p>

              {/* Highlights badges */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 pt-2">
                {[
                  { icon: BookOpen, text: 'Industry-Focused Courses' },
                  { icon: Smartphone, text: 'Mobile-Friendly Learning' },
                  { icon: ShieldCheck, text: 'Secure Access System' },
                  { icon: Award, text: 'Learn Anytime, Anywhere' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default"
                  >
                    <item.icon className="text-amber-500 shrink-0" size={18} />
                    <span className="text-[13px] font-bold text-slate-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <motion.button
                  onClick={() => scrollToSection('courses')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-blue to-blue-800 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 group"
                >
                  Explore Our Courses
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('contact')}
                  whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-slate-200 hover:border-brand-blue/30 text-slate-700 font-extrabold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Contact Admin Support
                </motion.button>
              </div>
            </motion.div>

            {/* Right Graphics (hidden on mobile, shown on lg) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5 relative justify-center hidden lg:flex"
            >
              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
              
              {/* iPhone Container */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  ease: "easeInOut" 
                }}
                className="relative w-[300px] h-[600px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 overflow-hidden ring-4 ring-slate-700/20 z-10 shrink-0"
              >
                
                {/* Speaker Grill / Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-800 rounded-full mb-1" />
                </div>

                {/* Internal App Screen with real screenshot */}
                <div className="h-full w-full bg-slate-950 rounded-[40px] relative overflow-hidden flex flex-col">
                  {/* Simulated Mobile Status Bar */}
                  <div className="h-10 pt-4 px-6 flex justify-between items-center text-[10px] font-bold text-white/95 shrink-0 z-20 bg-[#0B2C5F]">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-[2px] items-end h-2">
                        <div className="w-[2px] h-[3px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[5px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[7px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[9px] bg-white/90 rounded-[0.5px]" />
                      </div>
                      <div className="w-5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
                        <div className="h-full w-full bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Real Image Content */}
                  <div className="flex-1 w-full overflow-hidden bg-slate-950">
                    <img src="/hero-phone-screenshot.jpg" alt="NEXTSTEP AI Solutions App Dashboard" className="w-full h-full object-cover" />
                  </div>

                  {/* Simulated Home Indicator Bar */}
                  <div className="h-6 pb-2 flex items-center justify-center bg-white shrink-0 z-20">
                    <div className="w-28 h-1 bg-slate-300 rounded-full" />
                  </div>
                </div>

              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* 3. ABOUT US & GOALS */}
      <section id="about" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 bg-white rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Who We Are</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">About NEXTSTEP AI Solutions</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-medium text-base pt-2 leading-relaxed">
              We are an innovative IT company and training center bridging the gap between education and industry. By providing practical skills, live project experience, and digital solutions, we empower students, startups, and businesses to thrive in the modern tech ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Box: Focus points */}
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold text-brand-blue font-['Outfit']">Our Expertise & Services</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                We specialize in delivering top-tier solutions and professional training programs tailored to current industry demands.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'AI & Machine Learning', desc: 'Advanced AI-driven models, Data Science, and robust Python development.' },
                  { title: 'Software & Web Development', desc: 'End-to-end Web, Mobile App Development, and modern UI/UX Design.' },
                  { title: 'Cloud & Database Solutions', desc: 'Scalable cloud infrastructure and secure database management architectures.' },
                  { title: 'Real-Time & Final Year Projects', desc: 'Hands-on live project experience and comprehensive industrial internships.' },
                  { title: 'IT Consulting & Support', desc: 'Technical workshops, continuous website maintenance, and client-focused support.' }
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
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    To empower students, professionals, and businesses through quality education, practical training, innovative software development, and AI-driven technology solutions that create real-world impact.
                  </p>
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
                    To become a trusted leader in AI, software development, and technology training by building skilled professionals and delivering world-class digital solutions.
                  </p>
                </div>
              </div>

              {/* Goal Highlight */}
              <div className="p-6 rounded-3xl bg-brand-blue text-white shadow-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block mb-1">Our Commitment</span>
                  <p className="font-bold text-sm leading-snug">Delivering high-quality training and innovative software solutions while helping you embrace digital transformation.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-amber-400">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>
          </div>
          
        </motion.div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-gradient-to-br from-slate-900 via-[#0B2C5F] to-slate-900 text-white rounded-[24px] sm:rounded-[40px] border border-slate-800 shadow-2xl"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Excellence Guaranteed</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">Why Choose NEXTSTEP AI Solutions?</h2>
            <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full" />
            <p className="text-slate-300 font-medium text-sm pt-2">
              We stand out through our commitment to innovation, quality, integrity, and customer satisfaction across all our services and training programs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: BookOpen, title: 'Industry-Oriented Training', desc: 'Practical, hands-on learning designed to meet current market demands and standard methodologies.' },
              { icon: Layers, title: 'Live Projects & Internships', desc: 'Gain real-world experience through live project development and earn valuable internship certificates.' },
              { icon: Users, title: 'Expert Mentorship', desc: 'Learn directly from industry professionals with dedicated support and one-on-one career guidance.' },
              { icon: Laptop, title: 'Innovative Solutions', desc: 'Client-focused development of robust web, mobile, and AI applications to drive business growth.' },
              { icon: ShieldCheck, title: 'Affordable & Secure', desc: 'High-quality technical education and software solutions that fit your budget with uncompromising security.' },
              { icon: Activity, title: 'Multi-Industry Expertise', desc: 'Serving education, healthcare, banking, e-commerce, manufacturing, and startups with tailored tech.' },
              { icon: Award, title: 'AI & Technology Focused', desc: 'Curriculum built on modern AI algorithms, machine learning models, and cloud computing principles.' },
              { icon: Video, title: 'Interactive Learning', desc: 'Direct live streams and continuous communication to resolve doubts and foster a collaborative environment.' },
              { icon: MessageSquare, title: 'Dedicated Support', desc: 'Continuous website maintenance, IT consulting, and reliable client-first support channels.' }
            ].map((benefit, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg flex items-start gap-4 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
                  <benefit.icon size={20} className="text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">{benefit.title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* 5. COURSES SECTION */}
      <section id="courses" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-white rounded-[24px] sm:rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {displayedCourses.map((course) => {
              // Ensure we normalize subjects if format differs
              const subjectsList = course.subjects || [];
              const price = course.price ? (String(course.price).includes('₹') ? course.price : `₹${course.price}`) : '₹5,999';
              
              return (
                <motion.div 
                  key={course.id} 
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 flex flex-col justify-between overflow-hidden relative group transition-all"
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
                </motion.div>
              );
            })}
          </div>

        </motion.div>
      </section>

      {/* 6. PROJECTS SECTION */}
      <section id="projects" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-slate-50 rounded-[24px] sm:rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Exhibits</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Student Coding Projects</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              Browse professional-grade case studies and software projects our diploma students build and deploy in active classes.
            </p>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium animate-pulse h-48">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-semibold text-sm">No projects available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
                <motion.div 
                  key={project.id} 
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 transition-all flex flex-col justify-between relative overflow-hidden"
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
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      </section>

      {/* 7. MOBILE APP SECTION */}
      <section id="mobile-app" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-white rounded-[24px] sm:rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Graphics (Beautiful Simulated Smartphone Screen) */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1 relative">
              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl" />
              {/* iPhone Container */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  ease: "easeInOut" 
                }}
                className="relative w-[240px] h-[480px] sm:w-[300px] sm:h-[600px] bg-slate-900 rounded-[40px] sm:rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 overflow-hidden ring-4 ring-slate-700/20 z-10 shrink-0"
                style={{ willChange: 'transform' }}
              >
                
                {/* Speaker Grill / Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-800 rounded-full mb-1" />
                </div>

                {/* Internal App Screen with real screenshot */}
                <div className="h-full w-full bg-slate-950 rounded-[40px] relative overflow-hidden flex flex-col">
                  {/* Simulated Mobile Status Bar */}
                  <div className="h-10 pt-4 px-6 flex justify-between items-center text-[10px] font-bold text-white/95 shrink-0 z-20 bg-[#0B2C5F]">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-[2px] items-end h-2">
                        <div className="w-[2px] h-[3px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[5px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[7px] bg-white/90 rounded-[0.5px]" />
                        <div className="w-[2px] h-[9px] bg-white/90 rounded-[0.5px]" />
                      </div>
                      <div className="w-5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
                        <div className="h-full w-full bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Real Image Content */}
                  <div className="flex-1 w-full overflow-hidden bg-slate-950">
                    <img src="/ecosystem-phone-screenshot.jpg" alt="NEXTSTEP AI Solutions App Dashboard" className="w-full h-full object-cover" />
                  </div>

                  {/* Simulated Home Indicator Bar */}
                  <div className="h-6 pb-2 flex items-center justify-center bg-white shrink-0 z-20">
                    <div className="w-28 h-1 bg-slate-300 rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Information Details */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Modern Ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Learn Anywhere with NEXTSTEP AI Solutions App</h2>
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

        </motion.div>
      </section>

      {/* 8. LIVE CLASSES SECTION */}
      <section className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-gradient-to-br from-[#0B2C5F] via-[#0b254a] to-slate-950 text-white rounded-[24px] sm:rounded-[40px] border border-slate-800 shadow-2xl"
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Real-Time Learning</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">Interactive Live Classes</h2>
              <div className="w-16 h-1 bg-amber-400 rounded-full" />
              
              <p className="text-slate-300 leading-relaxed font-semibold text-base">
                Bridge the digital gap. Our interactive live stream system helps students connect directly with industry engineering mentors in scheduled video forums.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Join Live Classes Easily', desc: 'Single tap access to integrated live stream feeds, directly from the student dashboard.' },
                  { title: 'Interact & Code in Real Time', desc: 'Share your screens, debug complex code blocks, and ask instant questions during lectures.' },
                  { title: 'Direct Access to Meeting Links', desc: 'Secure Google Meet/Zoom integrations structured cleanly in class schedules.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-amber-400 border border-white/10">
                      <Video size={14} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
                      <p className="text-slate-300 text-xs mt-0.5 leading-relaxed font-semibold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 w-full max-w-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">Scheduled Feed</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Today, 7:30 PM</span>
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
                  <h4 className="font-bold text-white text-sm leading-tight">Advanced Deep Learning Neural Networks</h4>
                  <p className="text-xs text-slate-300 font-medium">Instructor: Prof. Nitin Sinha & Tech Mentors</p>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => scrollToSection('courses')}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/25 transition-all text-center"
                    >
                      Join Class Room
                    </button>
                    <button className="px-3.5 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all">Syllabus</button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </motion.div>
      </section>

      {/* 9. SECURITY CORE SHIELD SECTION */}
      <section id="security" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 text-white rounded-[24px] sm:rounded-[40px] border border-emerald-900 shadow-2xl"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Shield System</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">Secure Learning Environment</h2>
            <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full" />
            <p className="text-emerald-100/70 font-semibold text-sm pt-2">
              Our industry-grade protection framework is engineered directly to guard resources, prevent copycat activity, and assure verified students of the highest content integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: ShieldCheck, title: 'OTP Authentication Shield', desc: 'Secure verification binds student identity uniquely to a single mobile container.' },
              { icon: Lock, title: 'Secure Video HLS Streaming', desc: 'Encrypted segment parsing prevents screen scraping tools or raw video URL scraping.' },
              { icon: Laptop, title: 'Session Log-Based Control', desc: 'Allows active login instances on only one browser or mobile dashboard at a time.' },
              { icon: Smartphone, title: 'Screen Recording Blockers', desc: 'Smart background process checks automatically exit when screen capture software is run.' },
              { icon: Lock, title: 'Screenshot Capture Block', desc: 'Underlying Capacitor components block device keys to safeguard text notes and diagrams.' },
              { icon: ShieldCheck, title: 'Content Access Shield', desc: 'Granular admin dashboard oversight allows instantaneous session termination and security reviews.' }
            ].map((shield, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between transition-all"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <shield.icon size={24} />
                  </div>
                  <h3 className="font-extrabold text-white text-lg leading-tight">{shield.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed font-semibold">{shield.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 tracking-wider pt-6">
                  <ShieldCheck size={12} />
                  <span>Fully Integrated</span>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* 10. SYSTEM TOUR / FEATURES OVERVIEW */}
      <section className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 bg-white rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Inside the Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Robust Digital Infrastructure</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              A comprehensive system mapping out a highly functional panel for academy administrators and simple study logs for enrolled students.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Admin Panel Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-slate-50 p-8 rounded-[36px] border border-slate-200/60 shadow-premium flex flex-col justify-between hover:border-[#0B2C5F]/20 transition-all"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
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
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>


            </motion.div>

            {/* Student Dashboard Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-slate-50 p-8 rounded-[36px] border border-slate-200/60 shadow-premium flex flex-col justify-between hover:border-[#0B2C5F]/20 transition-all"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
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
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-150 mt-8 pt-5">
                <button 
                  onClick={() => scrollToSection('courses')}
                  className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-blue hover:text-brand-blue rounded-2xl font-bold text-xs uppercase tracking-wider text-center block transition-all hover:scale-[1.01]"
                >
                  Start Student Journey
                </button>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </section>

      {/* 11. TESTIMONIALS SECTION */}
      <section className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-slate-50 rounded-[24px] sm:rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-4">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Endorsements</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-['Outfit']">Diploma Student Reviews</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
            <p className="text-slate-500 font-semibold text-sm pt-2">
              Read how our dedicated e-learning focus helps diploma candidates boost technical competence and secure exceptional career opportunities.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#0B2C5F] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-blue/15 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <MessageSquare size={14} />
                <span>Share Your Review</span>
              </button>
            </div>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-premium animate-pulse flex flex-col justify-between h-48">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, idx) => <div key={idx} className="w-4 h-4 bg-slate-200 rounded-full" />)}
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                  <div className="border-t border-slate-100 mt-6 pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-2 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 shadow-premium">
              <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No student reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <motion.div 
                  key={review.id} 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-premium hover:border-[#0B2C5F]/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < (review.rating || 5) ? "#f59e0b" : "transparent"} 
                          className={i < (review.rating || 5) ? "text-amber-500" : "text-slate-300"} 
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-bold italic">“{review.review}”</p>
                  </div>
                  
                  <div className="border-t border-slate-100 mt-6 pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B2C5F] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      {(review.author || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs">{review.author}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block">{review.course}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      </section>

      {/* 12. CONTACT US SECTION */}
      <section id="contact" className="py-6 sm:py-12 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-white rounded-[24px] sm:rounded-[40px] border border-slate-200/60 shadow-premium"
        >
          
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
                <motion.a 
                  href="tel:9168482314"
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-[#0B2C5F]/20 transition-all block animate-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Call support</span>
                    <span className="block font-black text-slate-800 text-base leading-none">9168482314</span>
                  </div>
                </motion.a>

                {/* WhatsApp Support */}
                <motion.a 
                  href="https://wa.me/919168482314?text=Hi%20NEXTSTEP%20Academy,%20I%20want%20to%20know%20more%20about%20your%20courses."
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-500/20 transition-all block animate-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Chat on WhatsApp</span>
                    <span className="block font-black text-slate-800 text-base leading-none">Start WhatsApp Chat</span>
                  </div>
                </motion.a>

                {/* Info alert */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-3 text-xs text-amber-800 font-bold leading-relaxed">
                  <HelpCircle size={18} className="shrink-0 text-amber-600" />
                  <p>Inquiries will be responded to within 1-2 hours. Student registration configurations must be finalized by administrators in active console sessions.</p>
                </div>

              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-7 bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-premium relative overflow-hidden">
              
              <h3 className="font-extrabold text-xl text-brand-blue mb-2 font-['Outfit']">Request Admission</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">Fill out the fast form below to submit your enrollment queries and secure your academic seat.</p>

              {admissionSubmitted ? (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-100">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-extrabold text-2xl text-slate-900">Request Submitted!</h3>
                  <p className="text-slate-500 text-sm max-w-sm">Thank you for contacting NEXTSTEP AI Solutions. Our admissions officer will get in touch with you shortly via phone or email.</p>
                </div>
              ) : null}

              <form onSubmit={handleAdmissionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={admissionForm.name}
                      onChange={(e) => setAdmissionForm({...admissionForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-brand-blue text-sm font-semibold"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={admissionForm.phone}
                      onChange={(e) => setAdmissionForm({...admissionForm, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-brand-blue text-sm font-semibold"
                      placeholder="e.g. 9168482314"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={admissionForm.email}
                      onChange={(e) => setAdmissionForm({...admissionForm, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-brand-blue text-sm font-semibold"
                      placeholder="e.g. john@student.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Course Interested In *</label>
                    <select 
                      required
                      value={admissionForm.course}
                      onChange={(e) => setAdmissionForm({...admissionForm, course: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm font-semibold bg-white"
                    >
                      <option value="" disabled>Select a course</option>
                      {displayedCourses.map((c) => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                      <option value="Other / General Inquiry">Other / General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Detail Message / Query</label>
                  <textarea 
                    rows="4" 
                    value={admissionForm.message}
                    onChange={(e) => setAdmissionForm({...admissionForm, message: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-brand-blue text-sm font-medium resize-none"
                    placeholder="Describe your request or academic qualifications in detail..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingAdmission}
                  className="w-full py-3 bg-[#0B2C5F] text-white hover:bg-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-60"
                >
                  {submittingAdmission ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Admission Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </motion.div>
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
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 leading-none">AI Solutions</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                “Learn • Build • Innovate”
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
                  NEXTSTEP AI Solutions - Empowering Diploma Students with Technology & Innovation
                </span>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} NEXTSTEP AI Solutions. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="font-bold text-amber-500">Learn • Build • Innovate</span>
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

                {/* Course Teachers */}
                {(() => {
                  const courseTeachers = teachers.filter(t =>
                    Array.isArray(t.teachingCourseIds) && t.teachingCourseIds.includes(selectedCourse.id)
                  );
                  if (courseTeachers.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Your Instructor{courseTeachers.length > 1 ? 's' : ''}</h4>
                      <div className="space-y-3">
                        {courseTeachers.map((teacher) => (
                          <div key={teacher.id} className="flex items-start gap-4 bg-gradient-to-br from-[#0B2C5F]/5 to-slate-50 border border-[#0B2C5F]/10 rounded-2xl p-4">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#0B2C5F]/15 shrink-0 bg-slate-100 shadow-sm">
                              {teacher.imageUrl ? (
                                <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#0B2C5F]/10">
                                  <Users size={24} className="text-[#0B2C5F]" />
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-black text-slate-800 text-sm leading-tight">{teacher.name}</h5>
                              <span className="text-[11px] font-bold text-amber-600 block mt-0.5">{teacher.qualification}</span>
                              {teacher.description && (
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1.5 line-clamp-3">
                                  {teacher.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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

      {/* 16. REVIEW SUBMISSION MODAL */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            {/* Backdrop click exits */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsReviewModalOpen(false)} />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                <h3 className="text-xl font-black text-[#0B2C5F] font-['Outfit']">Share Your Experience</h3>
                <button 
                  onClick={() => setIsReviewModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {reviewSubmitted ? (
                <div className="flex-1 py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-md">
                    <Check size={36} strokeWidth={3} className="animate-bounce" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Review Submitted!</h4>
                  <p className="text-xs text-slate-500 font-semibold text-center max-w-xs">
                    Thank you! Your feedback has been sent to the administrator for review and approval.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5 overflow-y-auto py-4 flex-1 custom-scrollbar">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Your Name *</label>
                    <input 
                      type="text" 
                      required
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm font-semibold"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Course / Batch Name *</label>
                    <input 
                      type="text" 
                      required
                      value={reviewForm.course}
                      onChange={(e) => setReviewForm({ ...reviewForm, course: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm font-semibold"
                      placeholder="e.g. Operating System Batch"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Rating *</label>
                    <div className="flex items-center gap-1.5 pl-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star 
                            size={28} 
                            fill={star <= reviewForm.rating ? "#f59e0b" : "transparent"} 
                            className={star <= reviewForm.rating ? "text-amber-500" : "text-slate-300"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Your Review *</label>
                    <textarea 
                      rows="4" 
                      required
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-sm font-medium resize-none"
                      placeholder="Write your genuine feedback here..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full py-3 bg-[#0B2C5F] text-white hover:bg-slate-900 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-blue/15 flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
