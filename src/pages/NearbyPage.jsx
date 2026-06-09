import { useState, useEffect } from 'react'
import { X, Share } from 'lucide-react'
import { getShares, createShare } from '../utils/api'
import ShareCard from '../components/ShareCard'
import ShareDetail from '../components/ShareDetail'

export default function NearbyPage({ user, onLogin, foods = [] }) {
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedShareId, setSelectedShareId] = useState(null)
  const [toast, setToast] = useState('')
  const [createTitle, setCreateTitle] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [createPickupTime, setCreatePickupTime] = useState('')
  const [selectedFoodIds, setSelectedFoodIds] = useState([])

  // 加载分享列表
  useEffect(() => {
    loadShares()
  }, [])

  const loadShares = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getShares()
      setShares(data)
    } catch (err) {
      console.error('加载分享失败:', err)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    if (!user) {
      onLogin()
      return
    }
    setShowCreateModal(true)
  }

  const handleCreate = async () => {
    if (!createTitle.trim()) {
      showToast('请输入标题')
      return
    }
    if (selectedFoodIds.length === 0) {
      showToast('请至少选择一项食品')
      return
    }
    if (!createLocation.trim()) {
      showToast('请输入取货地点')
      return
    }
    try {
      const foodList = foods
        .filter(f => selectedFoodIds.includes(f.id))
        .map(f => f.name)
      await createShare(createTitle.trim(), foodList, {
        location: createLocation.trim(),
        pickup_time: createPickupTime.trim(),
      })
      setShowCreateModal(false)
      setCreateTitle('')
      setCreateLocation('')
      setCreatePickupTime('')
      setSelectedFoodIds([])
      loadShares()
      showToast('发布成功！')
    } catch (err) {
      showToast('发布失败')
    }
  }

  const handleCloseCreate = () => {
    setShowCreateModal(false)
    setCreateTitle('')
    setCreateLocation('')
    setCreatePickupTime('')
    setSelectedFoodIds([])
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">附近分享</h2>
      <p className="text-sm text-gray-400 mb-6">NEARBY SHARES</p>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-cheese border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadShares}
            className="mt-4 px-4 py-2 bg-cheese text-gray-800 rounded-lg"
          >
            重试
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && shares.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl block mb-4">🧀</span>
          <p className="text-gray-500">暂无分享</p>
          <p className="text-gray-400 text-sm mt-1">成为第一个分享者吧！</p>
        </div>
      )}

      {/* 分享列表 */}
      {!loading && !error && shares.length > 0 && (
        <div className="space-y-4">
          {shares.map((share) => (
            <ShareCard
              key={share.id}
              share={share}
              onClick={() => setSelectedShareId(share.id)}
            />
          ))}
        </div>
      )}

      {/* 发布按钮 */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-cheese text-gray-800 rounded-full shadow-lg hover:bg-cheese-dark active:scale-95 transition flex items-center justify-center"
        aria-label="发布分享"
      >
        <Share size={24} />
      </button>

      {/* 发布弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">发布分享</h3>
              <button
                onClick={handleCloseCreate}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                aria-label="关闭弹窗"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="分享标题 *"
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-cheese"
            />
            <input
              type="text"
              value={createLocation}
              onChange={(e) => setCreateLocation(e.target.value)}
              placeholder="取货地点 *（如：XX小区门口）"
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-cheese"
            />
            <input
              type="text"
              value={createPickupTime}
              onChange={(e) => setCreatePickupTime(e.target.value)}
              placeholder="取货时间（选填，如：今天18:00-20:00）"
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:border-cheese"
            />
            <p className="text-sm text-gray-600 mb-2">选择要分享的食品：</p>
            {foods.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">暂无食品可分享，请先在首页添加食品</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-lg mb-4">
                {foods.map((food) => {
                  const checked = selectedFoodIds.includes(food.id)
                  return (
                    <label
                      key={food.id}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 ${checked ? 'bg-cheese-light' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedFoodIds(prev =>
                            checked ? prev.filter(id => id !== food.id) : [...prev, food.id]
                          )
                        }
                        className="accent-cheese"
                      />
                      <span className="text-sm text-gray-700 flex-1">{food.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        food.status === 'expired' ? 'bg-red-100 text-red-600' :
                        food.status === 'warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {food.status === 'expired' ? '已过期' : food.status === 'warning' ? '临期' : '正常'}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={!createTitle.trim() || !createLocation.trim() || selectedFoodIds.length === 0}
              className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发布
            </button>
          </div>
        </div>
      )}

      {/* 分享详情 */}
      {selectedShareId && (
        <ShareDetail
          shareId={selectedShareId}
          onClose={() => setSelectedShareId(null)}
          onUpdate={loadShares}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
