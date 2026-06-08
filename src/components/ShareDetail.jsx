import { useState, useEffect, useRef } from 'react'
import { getShareDetail, claimShare, completeShare, cancelShare, getShareMessages, sendShareMessage } from '../utils/api'
import { getCurrentUser } from '../utils/userStorage'

export default function ShareDetail({ shareId, onClose, onUpdate }) {
  const [share, setShare] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const currentUser = getCurrentUser()

  useEffect(() => {
    loadShare()
  }, [shareId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadShare = async () => {
    try {
      setLoading(true)
      const data = await getShareDetail(shareId)
      setShare(data)
      if (currentUser && (data.user_id === currentUser.id || data.claimed_by === currentUser.id)) {
        const msgs = await getShareMessages(shareId)
        setMessages(msgs)
      }
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!currentUser) {
      setError('请先登录')
      return
    }
    try {
      setActionLoading(true)
      await claimShare(shareId)
      await loadShare()
      onUpdate?.()
    } catch (e) {
      setError(e.message || '领取失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      setActionLoading(true)
      await completeShare(shareId)
      await loadShare()
      onUpdate?.()
    } catch (e) {
      setError(e.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('确定要取消这个分享吗？')) return
    try {
      setActionLoading(true)
      await cancelShare(shareId)
      await loadShare()
      onUpdate?.()
    } catch (e) {
      setError(e.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return
    try {
      setSending(true)
      await sendShareMessage(shareId, newMessage.trim())
      setNewMessage('')
      const msgs = await getShareMessages(shareId)
      setMessages(msgs)
    } catch (e) {
      setError('发送失败')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const statusConfig = {
    available: { label: '可领取', color: 'bg-green-100 text-green-700' },
    claimed: { label: '已被领取', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: '已完成', color: 'bg-gray-100 text-gray-700' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-700' },
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">加载中...</div>
      </div>
    )
  }

  if (!share) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <p>未找到分享</p>
          <button onClick={onClose} className="mt-4 text-cheese">关闭</button>
        </div>
      </div>
    )
  }

  const foods = typeof share.foods === 'string' ? JSON.parse(share.foods) : (share.foods || [])
  const status = statusConfig[share.status] || statusConfig.available
  const isOwner = currentUser?.id === share.user_id
  const isClaimer = currentUser?.id === share.claimed_by
  const canMessage = currentUser && (isOwner || isClaimer)

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">分享详情</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-3xl">{share.avatar || '🧀'}</span>
            <div>
              <p className="font-medium">{share.username || '匿名用户'}</p>
              <p className="text-xs text-gray-400">{formatTime(share.created_at)}</p>
            </div>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div>
            <h3 className="font-medium text-gray-800">{share.title}</h3>
            {share.description && (
              <p className="text-sm text-gray-600 mt-1">{share.description}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {share.location && (
              <p className="text-sm"><span className="text-gray-500">取货地点：</span>{share.location}</p>
            )}
            {share.pickup_time && (
              <p className="text-sm"><span className="text-gray-500">取货时间：</span>{share.pickup_time}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">分享的食品（{foods.length}件）</p>
            <div className="flex flex-wrap gap-2">
              {foods.map((food, idx) => (
                <span key={idx} className="px-3 py-1 bg-cheese-light text-gray-700 rounded-full text-sm">
                  {typeof food === 'string' ? food : food.name}
                </span>
              ))}
            </div>
          </div>

          {share.status === 'claimed' && share.claimer_name && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">{share.claimer_avatar} {share.claimer_name}</span> 已领取此分享
              </p>
            </div>
          )}

          {canMessage && share.status === 'claimed' && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">站内消息</p>
              <div className="bg-gray-50 rounded-xl p-3 h-40 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">暂无消息，发送一条开始沟通</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.sender_id === currentUser?.id
                          ? 'bg-cheese text-gray-800'
                          : 'bg-white text-gray-700 border'
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-cheese"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-cheese text-gray-800 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  发送
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t space-y-2">
          {share.status === 'available' && !isOwner && currentUser && (
            <button
              onClick={handleClaim}
              disabled={actionLoading}
              className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium disabled:opacity-50"
            >
              {actionLoading ? '处理中...' : '我要领取'}
            </button>
          )}

          {share.status === 'available' && !isOwner && !currentUser && (
            <p className="text-center text-gray-500 text-sm py-2">请先登录后领取</p>
          )}

          {isOwner && share.status === 'claimed' && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {actionLoading ? '处理中...' : '确认完成'}
            </button>
          )}

          {isOwner && (share.status === 'available' || share.status === 'claimed') && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full py-2 text-red-500 text-sm"
            >
              取消分享
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
