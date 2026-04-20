import { useState, useEffect } from 'react'
import { getAvailableShares } from '../utils/shareService'
import { supabase } from '../utils/supabase'
import ShareCard from '../components/ShareCard'
import CreateShareModal from '../components/CreateShareModal'
import ShareDetailModal from '../components/ShareDetailModal'
import SupabaseAuthModal from '../components/SupabaseAuthModal'

export default function NearbyPage() {
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedShare, setSelectedShare] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState(null)
  const [toast, setToast] = useState('')

  // 监听 Supabase 认证状态
  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 加载分享列表
  useEffect(() => {
    loadShares()
  }, [])

  const loadShares = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAvailableShares()
      setShares(data)
    } catch (err) {
      console.error('加载分享失败:', err)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    if (!supabaseUser) {
      setShowAuthModal(true)
      return
    }
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadShares()
    showToast('发布成功！')
  }

  const handleClaimSuccess = () => {
    setSelectedShare(null)
    loadShares()
    showToast('领取成功！请尽快联系分享者')
  }

  const handleAuthSuccess = (user) => {
    setSupabaseUser(user)
    setShowAuthModal(false)
    showToast('登录成功！')
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
              onClick={() => setSelectedShare(share)}
            />
          ))}
        </div>
      )}

      {/* 发布按钮 */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-cheese text-gray-800 rounded-full shadow-lg text-xl hover:bg-cheese-dark active:scale-95 transition flex items-center justify-center"
      >
        📤
      </button>

      {/* 发布弹窗 */}
      {showCreateModal && user && (
        <CreateShareModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* 详情弹窗 */}
      {selectedShare && (
        <ShareDetailModal
          share={selectedShare}
          user={user}
          onClose={() => setSelectedShare(null)}
          onClaim={handleClaimSuccess}
          onLogin={onLogin}
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
