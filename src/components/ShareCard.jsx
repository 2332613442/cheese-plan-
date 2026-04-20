// 分享卡片组件

export default function ShareCard({ share, onClick }) {
  const profile = share.profiles || {}
  const foodCount = share.foods?.length || 0

  // 格式化时间
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString()
  }

  // 状态标签
  const statusConfig = {
    available: { label: '可领取', color: 'bg-green-100 text-green-700' },
    claimed: { label: '已被领', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-700' },
  }
  const status = statusConfig[share.status] || statusConfig.available

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex gap-3">
        {/* 图片预览 */}
        {share.images && share.images.length > 0 ? (
          <img
            src={share.images[0]}
            alt=""
            className="w-20 h-20 object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-cheese-light rounded-lg flex items-center justify-center shrink-0">
            <span className="text-3xl">🧀</span>
          </div>
        )}

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-800 truncate">{share.title}</h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {share.description || `包含${foodCount}件食品`}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{profile.avatar || '🧀'}</span>
              <span>{profile.username || '匿名用户'}</span>
              <span>·</span>
              <span>{formatTime(share.created_at)}</span>
            </div>
            {share.location_text && (
              <span className="text-xs text-gray-400">📍 {share.location_text}</span>
            )}
          </div>
        </div>
      </div>

      {/* 食品标签 */}
      {share.foods && share.foods.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {share.foods.slice(0, 3).map((food, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              {food.name}
            </span>
          ))}
          {share.foods.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-400">
              +{share.foods.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
