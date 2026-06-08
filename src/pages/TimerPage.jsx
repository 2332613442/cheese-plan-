import { getDaysRemaining } from '../utils/foodStatus'
import { TIME_RANGES } from '../data/timeRanges'

// 奶酪块图标组件 - 使用单独提取的图标文件
// 每个图标已从原始素材精确裁剪，确保100%还原
function CheeseIcon({ type, size = 48 }) {
  const validTypes = ['month', 'quarter', 'half', 'year', 'long', 'week']
  const iconType = validTypes.includes(type) ? type : 'month'

  return (
    <img
      src={`${import.meta.env.BASE_URL}images/cheese/${iconType}.png`}
      alt={iconType}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  )
}

export default function TimerPage({ foods, onNavigate }) {
  const getCategoryCount = (range) => {
    return foods.filter((food) => {
      const days = getDaysRemaining(food.expirationDate)
      return days >= range[0] && days <= range[1]
    }).length
  }

  // 计算急需处理的数量
  const urgentCount = getCategoryCount(TIME_RANGES[0].range)

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">保质期时长分类</h2>
      <p className="text-sm text-gray-400 mb-6">CLASSIFY</p>

      {/* 急需处理大图 */}
      <div
        onClick={() => urgentCount > 0 && onNavigate('home', { daysRange: TIME_RANGES[0].range })}
        className={`flex flex-col items-center mb-8 ${urgentCount > 0 ? 'cursor-pointer' : ''}`}
      >
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4 overflow-hidden ${
          urgentCount > 0 ? 'bg-gray-100 border-gray-200' : 'bg-green-50 border-green-200'
        }`}>
          {urgentCount > 0 ? (
            <img
              src={`${import.meta.env.BASE_URL}images/cry-face.png`}
              alt="急需处理"
              className="w-28 h-28 object-contain"
            />
          ) : (
            <span className="text-7xl">😊</span>
          )}
        </div>
        <p className="text-xl font-bold text-gray-800">
          {urgentCount > 0 ? '急需处理' : '暂无过期'}
        </p>
        {urgentCount > 0 ? (
          <p className="text-sm text-red-500 mt-1">{urgentCount} 件食品已过期，点击查看</p>
        ) : (
          <p className="text-sm text-green-500 mt-1">所有食品状态良好</p>
        )}
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-3 gap-3">
        {TIME_RANGES.slice(1).map((cat) => {
          const count = getCategoryCount(cat.range)
          const isEmpty = count === 0
          return (
            <div
              key={cat.id}
              onClick={() => count > 0 && onNavigate('home', { daysRange: cat.range })}
              className={`${cat.color} border-2 rounded-xl p-4 text-center flex flex-col items-center transition ${
                isEmpty ? 'opacity-40 cursor-default' : 'cursor-pointer hover:shadow-md active:scale-95'
              }`}
            >
              <CheeseIcon type={cat.cheeseType} size={48} />
              <p className="text-sm font-medium text-gray-700 mt-2">{cat.label}</p>
              <p className="text-xs text-gray-500">{count} 件</p>
            </div>
          )
        })}
      </div>

      {/* 底部统计 */}
      <div className="text-center mt-8 pb-4">
        <p className="text-sm text-gray-500">
          共管理 <span className="font-bold text-cheese">{foods.length}</span> 件食品
        </p>
      </div>
    </div>
  )
}
