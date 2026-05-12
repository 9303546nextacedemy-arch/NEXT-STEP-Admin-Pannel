import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Radio, 
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';

const iconMap = {
  Users: Users,
  BookOpen: BookOpen,
  Video: Video,
  FileText: FileText,
  Radio: Radio,
  Briefcase: Briefcase,
};

const colorMap = {
  blue: 'text-blue-600 bg-blue-100',
  gold: 'text-amber-600 bg-amber-100',
  indigo: 'text-indigo-600 bg-indigo-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  rose: 'text-rose-600 bg-rose-100',
  amber: 'text-amber-600 bg-amber-100',
};

const Dashboard = () => {
  const [stats, setStats] = useState([
    { id: 1, label: 'Total Students', count: 0, icon: 'Users', color: 'blue', collection: 'students' },
    { id: 2, label: 'Total Courses', count: 0, icon: 'BookOpen', color: 'gold', collection: 'courses' },
    { id: 3, label: 'Total Lectures', count: 0, icon: 'Video', color: 'indigo', collection: 'lectures' },
    { id: 4, label: 'Total Notes', count: 0, icon: 'FileText', color: 'emerald', collection: 'notes' },
    { id: 5, label: 'Live Classes', count: 0, icon: 'Radio', color: 'rose', collection: 'liveClasses' },
    { id: 6, label: 'Total Projects', count: 0, icon: 'Briefcase', color: 'amber', collection: 'projects' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = stats.map(stat => {
      return onSnapshot(collection(db, stat.collection), (snapshot) => {
        setStats(prev => prev.map(s => 
          s.id === stat.id ? { ...s, count: snapshot.size } : s
        ));
        setLoading(false);
      });
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = iconMap[stat.icon];
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-premium card-hover"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? <Loader2 className="animate-spin text-gray-300" size={24} /> : stat.count}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
