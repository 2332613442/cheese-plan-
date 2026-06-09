import { Camera, Clock, Gift } from 'lucide-react'

export default function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-16 px-4">
      {/* 奶酪图标带动画 */}
      <div className="mb-6">
        <img
          src={`${import.meta.env.BASE_URL}images/cheese-logo.png`}
          alt="奶酪"
          className="w-24 h-24 mx-auto opacity-60 animate-bounce"
          style={{ animationDuration: '2s' }}
        />
      </div>

      {/* 引导文案 */}
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        还没有添加食品
      </h3>
      <p className="text-gray-400 text-sm mb-8">
        记录食品保质期，减少浪费，从这里开始
      </p>

      {/* 快速添加按钮 */}
      <button
        onClick={onAdd}
        className="px-8 py-3 bg-cheese text-gray-800 rounded-full font-medium hover:bg-cheese-dark active:scale-95 transition shadow-md"
      >
        + 添加第一个食品
      </button>

      {/* 功能提示 */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-center">
        <div className="text-gray-400">
          <Camera size={28} className="mx-auto mb-1" />
          <span className="text-xs">扫码添加</span>
        </div>
        <div className="text-gray-400">
          <Clock size={28} className="mx-auto mb-1" />
          <span className="text-xs">临期提醒</span>
        </div>
        <div className="text-gray-400">
          <Gift size={28} className="mx-auto mb-1" />
          <span className="text-xs">捐赠分享</span>
        </div>
      </div>
    </div>
  )
}
