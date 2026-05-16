import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Briefcase, 
  Bell, 
  Settings,
  Scale,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Students', icon: Users, path: '/students' },
    { name: 'App Registrations', icon: UserPlus, path: '/app-registrations' },
    { name: 'Courses', icon: BookOpen, path: '/courses' },
    { name: 'Teachers', icon: User, path: '/teachers' },
    { name: 'Lectures', icon: Video, path: '/lectures' },
    { name: 'Notes', icon: FileText, path: '/notes' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Legal & Play Store', icon: Scale, path: '/legal-docs' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-brand-blue text-white transition-all duration-300 ease-in-out z-50 flex flex-col shadow-2xl",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 min-h-[5rem]">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-md ring-1 ring-white/20">
              <img
                src="/next-step-academy-logo.svg"
                alt=""
                className="w-full h-full object-contain scale-[1.02]"
              />
            </div>
            <span className="font-bold text-sm sm:text-[15px] leading-snug tracking-tight text-white min-w-0">
              Next Step Admin Panel
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-md ring-1 ring-white/20 mx-auto shrink-0">
            <img
              src="/next-step-academy-logo.svg"
              alt=""
              className="w-full h-full object-contain scale-[1.02]"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-brand-gold text-brand-blue font-semibold shadow-lg" 
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 min-w-[20px]" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-20 bg-brand-dark text-white px-3 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/10">
        <button 
          type="button"
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-white/70 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-200 w-full group"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to logout?")) return;
            try {
              await signOut(auth);
            } catch {
              /* ignore */
            }
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center text-brand-blue shadow-lg hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
