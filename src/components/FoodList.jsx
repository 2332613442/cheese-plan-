import { Search } from 'lucide-react'
import FoodCard from './FoodCard'
import EmptyState from './EmptyState'

export default function FoodList({ foods, onEdit, onDelete, onConsume, onAdd, hasFilters = false, batchMode = false, selectedIds = [], onToggleSelect }) {
  if (foods.length === 0) {
    // 区分"无数据"和"筛选无结果"
    if (hasFilters) {
      return (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">未找到匹配的食品</p>
          <p className="text-gray-400 text-sm mt-1">试试调整筛选条件</p>
        </div>
      )
    }
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div className="space-y-3">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          onEdit={onEdit}
          onDelete={onDelete}
          onConsume={onConsume}
          batchMode={batchMode}
          selected={selectedIds.includes(food.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
