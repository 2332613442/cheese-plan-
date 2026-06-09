import { useState } from 'react'
import { X } from 'lucide-react'

export default function CreatePostModal({ user, onClose, onSuccess }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    if (content.trim().length > 500) {
      alert('内容最多500字')
      return
    }

    onSuccess({
      author: user.username,
      avatar: user.avatar,
      content: content.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">发布动态</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="关闭弹窗"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-cheese-light rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">{user.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 mb-1">{user.username}</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的减少食物浪费小技巧..."
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:border-cheese resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {content.length}/500
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布
          </button>
        </form>
      </div>
    </div>
  )
}
