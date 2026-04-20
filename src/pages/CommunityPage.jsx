import { useState, useEffect } from 'react'
import { getPosts, addPost, likePost, deletePost, getLikedPosts, hasLiked } from '../utils/postStorage'
import CreatePostModal from '../components/CreatePostModal'
import ConfirmModal from '../components/ConfirmModal'

// 生成相对于当前时间的日期
const getRelativeDate = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const mockPosts = [
  {
    id: 'mock-1',
    author: 'Mice',
    avatar: '🐭',
    createdAt: getRelativeDate(1), // 1天前
    content: '今日捐赠',
    images: ['🍪', '🧃', '🍫'],
    likes: 27,
    comments: 30,
    shares: 18,
  },
  {
    id: 'mock-2',
    author: 'Micky',
    avatar: '🐹',
    createdAt: getRelativeDate(3), // 3天前
    content: '分享一下我的食品管理心得，定期检查冰箱真的很重要！',
    images: ['🥛', '🧀'],
    likes: 45,
    comments: 12,
    shares: 8,
  },
  {
    id: 'mock-3',
    author: '小芝士',
    avatar: '🧀',
    createdAt: getRelativeDate(7), // 1周前
    content: '刚刚清理了一批临期零食，送给邻居小朋友了~',
    images: ['🍬', '🍭', '🍪', '🧁'],
    likes: 89,
    comments: 23,
    shares: 15,
  },
]

export default function CommunityPage({ user, onLogin }) {
  const [posts, setPosts] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [likedIds, setLikedIds] = useState([])
  const [toast, setToast] = useState('')
  const [deletingPost, setDeletingPost] = useState(null)
  const [likeAnimation, setLikeAnimation] = useState(null)

  // 加载帖子：用户帖子 + mock帖子
  useEffect(() => {
    loadPosts()
    setLikedIds(getLikedPosts())
  }, [])

  const loadPosts = () => {
    const storedPosts = getPosts()
    // 格式化用户帖子
    const formattedPosts = storedPosts.map(post => ({
      ...post,
      time: formatRelativeTime(post.createdAt),
      images: [],
      comments: 0,
      shares: 0,
    }))
    // mock帖子也格式化时间
    const formattedMockPosts = mockPosts.map(post => ({
      ...post,
      time: formatRelativeTime(post.createdAt),
    }))
    setPosts([...formattedPosts, ...formattedMockPosts])
  }

  // 相对时间格式化
  const formatRelativeTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  const handleLike = (postId) => {
    // 检查是否已点赞
    if (likedIds.includes(postId)) {
      showToast('已经点过赞了')
      return
    }

    // 触发动画
    setLikeAnimation(postId)
    setTimeout(() => setLikeAnimation(null), 300)

    // 保存点赞（非mock帖子）
    if (!String(postId).startsWith('mock-')) {
      likePost(postId)
    }

    // 更新状态
    setLikedIds([...likedIds, postId])
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  const handleCreatePost = (postData) => {
    addPost(postData)
    loadPosts()
  }

  const handleAddClick = () => {
    if (!user) {
      onLogin()
      return
    }
    setShowCreateModal(true)
  }

  const handleDeletePost = (post) => {
    setDeletingPost(post)
  }

  const confirmDeletePost = () => {
    if (deletingPost) {
      deletePost(deletingPost.id)
      loadPosts()
      setDeletingPost(null)
    }
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

  const handleCommentClick = () => {
    showToast('评论功能暂未开放')
  }

  const handleShareClick = () => {
    showToast('转发功能暂未开放')
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">交流区</h2>
      <p className="text-sm text-gray-400 mb-6">COMMUNICATION REGION</p>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {/* 作者信息 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{post.avatar}</span>
                <div>
                  <p className="font-medium text-gray-800">{post.author}</p>
                  <p className="text-xs text-gray-400">{post.time}</p>
                </div>
              </div>
              {/* 删除按钮（仅自己的帖子） */}
              {user && post.author === user.username && !String(post.id).startsWith('mock-') && (
                <button
                  onClick={() => handleDeletePost(post)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  删除
                </button>
              )}
            </div>

            {/* 内容 */}
            <p className="text-gray-700 mb-3">{post.content}</p>

            {/* 图片/表情展示 - 仅当有图片时显示 */}
            {post.images && post.images.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 bg-cheese-light rounded-lg flex items-center justify-center text-2xl"
                  >
                    {img}
                  </div>
                ))}
              </div>
            )}

            {/* 互动按钮 */}
            <div className="flex gap-6 text-sm text-gray-500 border-t pt-3">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1 transition-transform ${
                  likedIds.includes(post.id) ? 'text-red-500' : 'hover:text-cheese'
                } ${likeAnimation === post.id ? 'scale-125' : ''}`}
              >
                <span>{likedIds.includes(post.id) ? '❤️' : '👍'}</span>
                <span>点赞 {post.likes}</span>
              </button>
              <button
                onClick={handleCommentClick}
                className="flex items-center gap-1 hover:text-cheese"
              >
                <span>💬</span>
                <span>评论 {post.comments}</span>
              </button>
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1 hover:text-cheese"
              >
                <span>🔄</span>
                <span>转发 {post.shares}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 发帖提示 */}
      <div className="mt-6 p-4 bg-cheese-light rounded-xl text-center">
        <p className="text-gray-800">💡 每日一捐，传递温暖</p>
        <p className="text-sm text-gray-700 mt-1">分享你的食品管理经验</p>
      </div>

      {/* 发帖浮动按钮 */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-cheese text-gray-800 rounded-full shadow-lg text-xl hover:bg-cheese-dark active:scale-95 transition flex items-center justify-center"
      >
        ✏️
      </button>

      {/* 发帖弹窗 */}
      {showCreateModal && user && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreatePost}
        />
      )}

      {/* 删除确认弹窗 */}
      {deletingPost && (
        <ConfirmModal
          title="删除帖子"
          message="确定要删除这条帖子吗？"
          confirmText="删除"
          cancelText="取消"
          danger
          onConfirm={confirmDeletePost}
          onCancel={() => setDeletingPost(null)}
        />
      )}

      {/* Toast提示 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
