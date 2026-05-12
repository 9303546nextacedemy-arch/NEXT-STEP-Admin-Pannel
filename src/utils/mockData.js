export const stats = [
  { id: 1, label: 'Total Students', count: '1,284', icon: 'Users', color: 'blue', change: '+12%' },
  { id: 2, label: 'Total Courses', count: '42', icon: 'BookOpen', color: 'gold', change: '+3' },
  { id: 3, label: 'Total Lectures', count: '856', icon: 'Video', color: 'indigo', change: '+24' },
  { id: 4, label: 'Total Notes', count: '156', icon: 'FileText', color: 'emerald', change: '+10' },
  { id: 5, label: 'Live Classes', count: '8', icon: 'Radio', color: 'rose', change: 'Today' },
  { id: 6, label: 'Total Projects', count: '94', icon: 'Briefcase', color: 'amber', change: '+5' },
];

export const recentActivity = {
  lectures: [
    { id: 1, title: 'Introduction to React Hooks', course: 'Modern Web Dev', date: '2 hours ago' },
    { id: 2, title: 'Advanced CSS Layouts', course: 'UI/UX Design', date: '4 hours ago' },
    { id: 3, title: 'Database Normalization', course: 'Backend Systems', date: 'Yesterday' },
  ],
  students: [
    { id: 1, name: 'Rahul Sharma', phone: '+91 9876543210', date: '1 hour ago' },
    { id: 2, name: 'Priya Patel', phone: '+91 8765432109', date: '3 hours ago' },
    { id: 3, name: 'Amit Kumar', phone: '+91 7654321098', date: '5 hours ago' },
  ],
  liveClasses: [
    { id: 1, title: 'Q&A Session: Data Structures', time: '14:00 PM', date: 'Today' },
    { id: 2, title: 'Project Review: E-commerce', time: '10:00 AM', date: 'Tomorrow' },
  ]
};

export const courses = [
  { id: 1, title: 'Full Stack Web Development', description: 'Master HTML, CSS, JS, React, and Node.js', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60' },
  { id: 2, title: 'UI/UX Design Masterclass', description: 'Learn Figma, prototyping and design systems', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60' },
  { id: 3, title: 'Python for Data Science', description: 'Analyze data with Pandas, NumPy and Matplotlib', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60' },
];

export const students = [
  { id: 1, phone: '+91 9876543210', status: 'Active', created: '2026-04-15' },
  { id: 2, phone: '+91 8765432109', status: 'Inactive', created: '2026-04-18' },
  { id: 3, phone: '+91 7654321098', status: 'Active', created: '2026-04-20' },
  { id: 4, phone: '+91 6543210987', status: 'Active', created: '2026-04-22' },
];
