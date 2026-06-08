import { useState } from 'react'
import { getCategoryById } from '../data/categories'
import { getDonationStats } from '../utils/donationStorage'
import { getConsumptionStats } from '../utils/consumptionStorage'
import { EXPIRED_RANGE } from '../data/timeRanges'
import SettingsModal from '../components/SettingsModal'

export default function ProfilePage({ foods, user, onLogin, onLogout, onNavigate, onSettingsChange, onCloudSync, onCloudRestore, syncStatus }) {
  const [showSettings, setShowSettings] = useState(false)

  const expiredFoods = foods.filter(f => f.status === 'expired')
  const warningFoods = foods.filter(f => f.status === 'warning')
  const totalFoods = foods.length
  const donationStats = getDonationStats()
  const consumptionStats = getConsumptionStats()

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">个人主页</h2>
      <p className="text-sm text-gray-400 mb-6">PROFILE</p>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cheese-light rounded-full flex items-center justify-center">
              <span className="text-3xl">{user.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-800">{user.username}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-cheese-light text-gray-800 rounded-full text-sm">
                  用户等级：Lv{user.level}
                </span>
                <button
                  onClick={() => onNavigate('community')}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 transition"
                >
                  <span>👥</span> 交流区
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl text-gray-400">👤</span>
            </div>
            <p className="text-gray-500 mb-4">登录后查看个人信息</p>
            <button
              onClick={onLogin}
              className="px-6 py-2 bg-cheese text-gray-800 rounded-full font-medium hover:bg-cheese-dark transition"
            >
              立即登录
            </button>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-cheese-light rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-cheese">{totalFoods}</p>
          <p className="text-sm text-gray-600">管理中的食品</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{consumptionStats.total}</p>
          <p className="text-sm text-gray-600">已消耗食品</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{warningFoods.length}</p>
          <p className="text-sm text-gray-600">临期食品</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{expiredFoods.length}</p>
          <p className="text-sm text-gray-600">已过期食品</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{donationStats.totalDonations}</p>
          <p className="text-sm text-gray-600">捐赠次数</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-500">{donationStats.totalFoods}</p>
          <p className="text-sm text-gray-600">捐赠食品数</p>
        </div>
      </div>

      {/* 过期食品 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">过期食品</h3>
          {expiredFoods.length > 4 && (
            <button
              onClick={() => onNavigate('home', { daysRange: EXPIRED_RANGE })}
              className="text-sm text-cheese hover:underline"
            >
              查看全部 ({expiredFoods.length})
            </button>
          )}
        </div>
        {expiredFoods.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <span className="text-4xl">🎉</span>
            <p className="text-gray-500 mt-2">没有过期食品，很棒！</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {expiredFoods.slice(0, 4).map((food) => {
              const category = getCategoryById(food.category)
              return (
                <div
                  key={food.id}
                  onClick={() => onNavigate('home', { daysRange: EXPIRED_RANGE })}
                  className="shrink-0 w-20 h-20 bg-red-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-100 transition"
                >
                  <span className="text-2xl">{category?.icon || '📦'}</span>
                  <p className="text-xs text-gray-600 mt-1 truncate w-full text-center px-1">
                    {food.name}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 最近添加 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">最近添加</h3>
          {foods.length > 4 && (
            <button
              onClick={() => onNavigate('home')}
              className="text-sm text-cheese hover:underline"
            >
              查看全部 ({foods.length})
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...foods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map((food) => {
            const category = getCategoryById(food.category)
            return (
              <div
                key={food.id}
                onClick={() => onNavigate('home')}
                className="shrink-0 w-20 h-20 bg-cheese-light rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-cheese transition"
              >
                <span className="text-2xl">{category?.icon || '🧀'}</span>
                <p className="text-xs text-gray-600 mt-1 truncate w-full text-center px-1">
                  {food.name}
                </p>
              </div>
            )
          })}
          {foods.length === 0 && (
            <div className="w-full bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500">暂无记录</p>
            </div>
          )}
        </div>
      </div>

      {/* 设置入口 */}
      <div className="mt-8 space-y-3">
        {/* 云同步按钮 */}
        {user && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-3">☁️ 云端同步</p>
            <div className="flex gap-2">
              <button
                onClick={onCloudSync}
                disabled={syncStatus === 'syncing'}
                className="flex-1 py-2 bg-cheese text-gray-800 rounded-lg text-sm font-medium hover:bg-cheese-dark transition disabled:opacity-50"
              >
                {syncStatus === 'syncing' ? '同步中...' : '上传到云端'}
              </button>
              <button
                onClick={onCloudRestore}
                disabled={syncStatus === 'restoring'}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                {syncStatus === 'restoring' ? '恢复中...' : '从云端恢复'}
              </button>
            </div>
            {syncStatus === 'success' && <p className="text-green-500 text-xs mt-2">✓ 上传成功</p>}
            {syncStatus === 'restored' && <p className="text-green-500 text-xs mt-2">✓ 恢复成功</p>}
            {syncStatus === 'error' && <p className="text-red-500 text-xs mt-2">✗ 操作失败</p>}
          </div>
        )}
        <button
          onClick={() => setShowSettings(true)}
          className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 flex items-center justify-center gap-2 px-4 hover:bg-gray-50 transition"
        >
          <span>⚙️</span> 设置
        </button>
        {user && (
          <button
            onClick={onLogout}
            className="w-full py-3 bg-white border border-red-200 rounded-xl text-red-500 flex items-center justify-center px-4 hover:bg-red-50 transition"
          >
            退出登录
          </button>
        )}
      </div>

      {/* 版本信息 */}
      <p className="text-center text-xs text-gray-400 mt-6">
        奶酪计划 v1.0.0
      </p>

      {/* 设置弹窗 */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={onSettingsChange}
        />
      )}
    </div>
  )
}
