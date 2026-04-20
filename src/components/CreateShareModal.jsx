import { useState } from 'react'
import { createShare } from '../utils/shareService'
import { getFoods } from '../utils/storage'
import { getCategoryById } from '../data/categories'
import { getUnitName } from '../data/units'

export default function CreateShareModal({ user, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFoods, setSelectedFoods] = useState([])
  const [locationText, setLocationText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 获取可分享的食品（临期和正常的）
  const foods = getFoods().filter(f => f.status !== 'expired')

  const toggleFood = (food) => {
    setSelectedFoods(prev => {
      const exists = prev.find(f => f.id === food.id)
      if (exists) {
        return prev.filter(f => f.id !== food.id)
      } else {
        return [...prev, food]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('请输入标题')
      return
    }

    if (selectedFoods.length === 0) {
      setError('请至少选择一件食品')
      return
    }

    setSubmitting(true)

    try {
      await createShare({
        title: title.trim(),
        description: description.trim(),
        foods: selectedFoods.map(f => ({
          name: f.name,
          category: f.category,
          expirationDate: f.expirationDate,
          quantity: f.quantity || 1,
          unit: f.unit || 'piece',
        })),
        images: selectedFoods.filter(f => f.image).map(f => f.image),
        location: locationText ? { text: locationText } : null,
      })

      onSuccess()
    } catch (err) {
      console.error('创建分享失败:', err)
      setError(err.message || '发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">发布分享</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：分享一些临期零食"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充说明（可选）"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese resize-none"
            />
          </div>

          {/* 选择食品 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              选择要分享的食品 * ({selectedFoods.length}件已选)
            </label>
            {foods.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">暂无可分享的食品</p>
                <p className="text-gray-400 text-sm">请先添加一些食品</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {foods.map((food) => {
                  const isSelected = selectedFoods.some(f => f.id === food.id)
                  const category = getCategoryById(food.category)
                  return (
                    <div
                      key={food.id}
                      onClick={() => toggleFood(food)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                        isSelected ? 'bg-cheese-light' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-cheese bg-cheese' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                      {food.image ? (
                        <img src={food.image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {food.quantity > 1 && `${food.quantity}${getUnitName(food.unit)} · `}
                          到期：{food.expirationDate}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 位置 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">大致位置</label>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="如：朝阳区望京"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-cheese text-gray-800 rounded-lg font-medium hover:bg-cheese-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '发布中...' : '发布分享'}
          </button>
        </form>
      </div>
    </div>
  )
}
