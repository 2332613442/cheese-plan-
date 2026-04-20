import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import FoodList from '../components/FoodList'
import AddFoodModal from '../components/AddFoodModal'
import EditFoodModal from '../components/EditFoodModal'
import ConfirmModal from '../components/ConfirmModal'
import { deleteFood } from '../utils/storage'
import { addConsumption } from '../utils/consumptionStorage'
import { getDaysRemaining } from '../utils/foodStatus'
import { getRangeLabel } from '../data/timeRanges'

export default function HomePage({ foods, onReload, daysFilter, onClearFilter }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('expiration') // expiration, name, created
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [deletingFood, setDeletingFood] = useState(null)
  const [consumingFood, setConsumingFood] = useState(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

  const handleDelete = (id) => {
    const food = foods.find(f => f.id === id)
    setDeletingFood(food)
  }

  const confirmDelete = () => {
    if (deletingFood) {
      deleteFood(deletingFood.id)
      onReload()
      setDeletingFood(null)
    }
  }

  const handleConsume = (food) => {
    setConsumingFood(food)
  }

  const confirmConsume = () => {
    if (consumingFood) {
      addConsumption(consumingFood)
      deleteFood(consumingFood.id)
      onReload()
      setConsumingFood(null)
    }
  }

  // 获取当前筛选标签
  const filterLabel = getRangeLabel(daysFilter)

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory
    // 时长筛选
    const matchesDays = daysFilter
      ? (() => {
          const days = getDaysRemaining(food.expirationDate)
          return days >= daysFilter[0] && days <= daysFilter[1]
        })()
      : true
    return matchesSearch && matchesCategory && matchesDays
  })

  // 排序
  const sortedFoods = [...filteredFoods].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'zh-CN')
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'expiration':
      default:
        return new Date(a.expirationDate) - new Date(b.expirationDate)
    }
  })

  // 批量操作
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedFoods.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sortedFoods.map(f => f.id))
    }
  }

  const exitBatchMode = () => {
    setBatchMode(false)
    setSelectedIds([])
  }

  const confirmBatchDelete = () => {
    selectedIds.forEach(id => deleteFood(id))
    onReload()
    setShowBatchDeleteConfirm(false)
    exitBatchMode()
  }

  return (
    <div className="p-4 space-y-4">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* 时长筛选标签 */}
      {filterLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">筛选：</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-cheese-light text-gray-700 rounded-full text-sm">
            {filterLabel}
            <button
              onClick={onClearFilter}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* 排序和统计 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">共 {sortedFoods.length} 件</span>
        <div className="flex items-center gap-3">
          {!batchMode && sortedFoods.length > 0 && (
            <button
              onClick={() => setBatchMode(true)}
              className="text-sm text-gray-500 hover:text-cheese"
            >
              管理
            </button>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="expiration">按到期时间</option>
            <option value="name">按名称</option>
            <option value="created">按添加时间</option>
          </select>
        </div>
      </div>

      {/* 批量操作栏 */}
      {batchMode && (
        <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
          <button
            onClick={toggleSelectAll}
            className="text-sm text-gray-600"
          >
            {selectedIds.length === sortedFoods.length ? '取消全选' : '全选'}
          </button>
          <span className="text-sm text-gray-500">已选 {selectedIds.length} 件</span>
          <button
            onClick={exitBatchMode}
            className="text-sm text-gray-500"
          >
            取消
          </button>
        </div>
      )}

      <FoodList
        foods={sortedFoods}
        onEdit={batchMode ? null : setEditingFood}
        onDelete={batchMode ? null : handleDelete}
        onConsume={batchMode ? null : handleConsume}
        onAdd={() => setShowAddModal(true)}
        hasFilters={!!searchQuery || selectedCategory !== 'all' || !!daysFilter}
        batchMode={batchMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {/* 批量删除按钮 */}
      {batchMode && selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4">
          <button
            onClick={() => setShowBatchDeleteConfirm(true)}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
          >
            删除选中 ({selectedIds.length})
          </button>
        </div>
      )}

      {!batchMode && (
        <button
          className="fixed bottom-24 right-6 w-14 h-14 bg-cheese text-gray-800 rounded-full shadow-lg text-2xl hover:bg-cheese-dark active:scale-95 transition"
          onClick={() => setShowAddModal(true)}
        >
          +
        </button>
      )}

      {showAddModal && (
        <AddFoodModal
          onClose={() => setShowAddModal(false)}
          onSuccess={onReload}
        />
      )}

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onSuccess={onReload}
        />
      )}

      {deletingFood && (
        <ConfirmModal
          title="删除食品"
          message={`确定要删除"${deletingFood.name}"吗？`}
          confirmText="删除"
          cancelText="取消"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeletingFood(null)}
        />
      )}

      {showBatchDeleteConfirm && (
        <ConfirmModal
          title="批量删除"
          message={`确定要删除选中的 ${selectedIds.length} 件食品吗？`}
          confirmText="删除"
          cancelText="取消"
          danger
          onConfirm={confirmBatchDelete}
          onCancel={() => setShowBatchDeleteConfirm(false)}
        />
      )}

      {consumingFood && (
        <ConfirmModal
          title="标记为已消耗"
          message={`确定将"${consumingFood.name}"标记为已消耗吗？`}
          confirmText="确认"
          cancelText="取消"
          onConfirm={confirmConsume}
          onCancel={() => setConsumingFood(null)}
        />
      )}
    </div>
  )
}
