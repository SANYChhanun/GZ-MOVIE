// src/components/ui/StatCard.jsx
export default function StatCard({ icon, label, value, delta, deltaTone, live }) {
  return (
    <div className="bg-[#181818] p-5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{label}</span>
        {icon && <span className="text-[#E50914]">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-white flex items-center">
        {value}
        {live && (
          <span className="ml-2 inline-block w-2 h-2 bg-[#E50914] rounded-full animate-pulse shadow-[0_0_6px_2px_rgba(229,9,20,0.6)]"></span>
        )}
      </div>
      {delta && (
        <p className={`text-sm mt-1 font-medium ${deltaTone === 'up' ? 'text-emerald-400' : 'text-rose-500'}`}>
          {delta}
        </p>
      )}
    </div>  
  );
}