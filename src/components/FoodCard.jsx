import { getStatusInfo, getDaysRemaining } from '../utils/foodStatus'
import { getCategoryById } from '../data/categories'
import { getUnitName } from '../data/units'

export default function FoodCard({ food, onEdit, onDelete, onConsume, batchMode = false, selected = false, onToggleSelect }) {
  const statusInfo = getStatusInfo(food.status)
  const category = getCategoryById(food.category)
  const daysRemaining = getDaysRemaining(food.expirationDate)

  const daysText = daysRemaining <= 0
    ? `已过期 ${Math.abs(daysRemaining) || 1} 天`
    : `剩余 ${daysRemaining} 天`

  // 数量显示
  const quantityText = food.quantity && food.quantity > 1
    ? `${food.quantity}${getUnitName(food.unit)}`
    : null

  const handleClick = () => {
    if (batchMode && onToggleSelect) {
      onToggleSelect(food.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg p-4 shadow-sm border transition ${
        batchMode ? 'cursor-pointer' : ''
      } ${
        selected ? 'border-cheese bg-cheese-light' : 'border-gray-100'
      }`}
    >
      <div className="flex gap-3">
        {/* 食品图片 */}
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-16 h-16 object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">{category.icon}</span>
          </div>
        )}

        {/* 批量选择框 */}
        {batchMode && (
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 self-center ${
            selected ? 'border-cheese bg-cheese' : 'border-gray-300'
          }`}>
            {selected && <span className="text-white text-xs">✓</span>}
          </div>
        )}

        {/* 食品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-medium text-gray-800 truncate">{food.name}</h3>
            {quantityText && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {quantityText}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {daysText} · 到期: {food.expirationDate}
          </p>
        </div>

        {/* 操作按钮 */}
        {!batchMode && (
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => onConsume && onConsume(food)}
              className="text-gray-400 hover:text-green-500"
              title="已消耗"
            >
              ✅
            </button>
            <button
              onClick={() => onEdit && onEdit(food)}
              className="text-gray-400 hover:text-cheese"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete && onDelete(food.id)}
              className="text-gray-400 hover:text-red-500"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
