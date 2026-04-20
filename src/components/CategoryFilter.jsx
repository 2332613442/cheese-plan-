import { categories } from '../data/categories'

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`shrink-0 px-3 py-1 rounded-full text-sm ${
          selected === 'all'
            ? 'bg-cheese text-gray-800'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-3 py-1 rounded-full text-sm ${
            selected === cat.id
              ? 'bg-cheese text-gray-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}
