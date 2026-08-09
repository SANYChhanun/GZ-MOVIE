// src/components/common/Badge.jsx

// Export ទាំងនេះសម្រាប់ប្រើក្នុង admin pages
export const accessTone = {
  free: 'bg-green-500/20 text-green-400 border border-green-500/50',
  member: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
  purchase: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
};

export const statusTone = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/50',
  inactive: 'bg-gray-500/20 text-gray-400 border border-gray-500/50',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
  expired: 'bg-red-500/20 text-red-400 border border-red-500/50',
  completed: 'bg-green-500/20 text-green-400 border border-green-500/50',
  failed: 'bg-red-500/20 text-red-400 border border-red-500/50',
  cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/50',
};

const variants = {
  vip: 'bg-yellow-500 text-black font-bold',
  admin: 'bg-purple-500 text-white font-bold',
  user: 'bg-blue-500 text-white',
  success: 'bg-green-500 text-white',
  danger: 'bg-red-500 text-white',
  warning: 'bg-orange-500 text-white',
  info: 'bg-cyan-500 text-white',
};

export default function Badge({ children, variant = 'user', className = '' }) {
  const colorClass = variants[variant] || variants.user;
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {children}
    </span>
  );
}