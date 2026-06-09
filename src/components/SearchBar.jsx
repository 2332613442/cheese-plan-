import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={18} />
      </span>
      <input
        type="text"
        placeholder="搜索食品..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-cheese"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="清除搜索"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
