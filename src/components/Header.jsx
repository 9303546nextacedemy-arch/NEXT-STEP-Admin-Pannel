import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-96 group focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all">
        <Search size={18} className="text-gray-400 group-focus-within:text-brand-blue" />
        <input 
          type="text" 
          placeholder="Search for courses, students, lectures..." 
          className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
          <Bell size={20} className="text-gray-600 group-hover:text-brand-blue" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">Admin User</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Head Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue border border-brand-blue/10 group-hover:bg-brand-blue group-hover:text-white transition-all overflow-hidden shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
