import { useState, useEffect } from 'react'
import { Lightbulb, PenSquare, Share, FileText } from 'lucide-react'
import { getPosts as getLocalPosts, addPost as addLocalPost, deletePost, getLikedPosts, addLikedPost, likePost as likeLocalPost, updatePost } from '../utils/postStorage'
import { getPosts as getApiPosts, createPost as createApiPost, likePost as likeApiPost, getComments, addComment } from '../utils/api'
import CreatePostModal from '../components/CreatePostModal'
import ConfirmModal from '../components/ConfirmModal'
import NearbyPage from './NearbyPage'

export default function CommunityPage({ user, onLogin, foods }) {
  const [activeSubTab, setActiveSubTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [likedIds, setLikedIds] = useState([])
  const [toast, setToast] = useState('')
  const [deletingPost, setDeletingPost] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [likeAnimation, setLikeAnimation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState(null)
  const [comments, setComments] = useState({})
  const [commentTexts, setCommentTexts] = useState({})
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    loadPosts()
    setLikedIds(getLikedPosts())
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      // 尝试从服务器加载
      const apiPosts = await getApiPosts()
      const formattedApiPosts = apiPosts.map(post => ({
        id: post.id,
        author: post.username || '用户',
        avatar: post.avatar || '🧀',
        createdAt: post.created_at,
        content: post.content,
        images: post.images || [],
        likes: post.likes || 0,
        comments: 0,
        shares: 0,
        isApi: true,
      }))

      // 本地帖子去重：过滤掉内容与API帖子重复的条目（同作者+同内容）
      const apiContents = new Set(formattedApiPosts.map(p => `${p.author}|${p.content}`))
      const localPosts = getLocalPosts()
        .filter(post => !apiContents.has(`${post.author}|${post.content}`))
        .map(post => ({
          ...post,
          isApi: false,
        }))

      const allPosts = [...formattedApiPosts, ...localPosts]
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setPosts(allPosts.map(p => ({ ...p, time: formatRelativeTime(p.createdAt) })))
    } catch (err) {
      // 服务器不可用，使用本地数据
      const localPosts = getLocalPosts().map(post => ({
        ...post,
        time: formatRelativeTime(post.createdAt),
        isApi: false,
      }))
      setPosts(localPosts)
    } finally {
      setLoading(false)
    }
  }

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

  const handleLike = async (postId) => {
    if (likedIds.includes(postId)) {
      showToast('已经点过赞了')
      return
    }

    setLikeAnimation(postId)
    setTimeout(() => setLikeAnimation(null), 300)

    // 更新本地状态
    const updatedIds = [...likedIds, postId]
    setLikedIds(updatedIds)
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ))

    // 尝试调用API
    try {
      if (user) {
        await likeApiPost(postId)
      }
      addLikedPost(postId)
    } catch (err) {
      addLikedPost(postId)
    }

    // 对本地帖子同步更新存储中的点赞数
    const targetPost = posts.find(p => p.id === postId)
    if (targetPost && !targetPost.isApi) {
      likeLocalPost(postId)
    }
  }

  const handleCreatePost = async (postData) => {
    // 始终保存到本地，确保离线时也能看到自己的帖子
    addLocalPost(postData)
    if (user) {
      try {
        await createApiPost(postData.content, postData.images || [])
      } catch (err) {
        // 服务器失败，本地已保存，忽略错误
      }
    }
    loadPosts()
    showToast('发布成功')
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

  const handleEditPost = (post) => {
    setEditingPost(post)
  }

  const handleUpdatePost = (postData) => {
    updatePost(postData.id, {
      content: postData.content,
      images: postData.images,
    })
    loadPosts()
    setEditingPost(null)
    showToast('修改成功')
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

  const handleExpandPost = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    if (!comments[postId]) {
      setLoadingComments(true)
      try {
        const data = await getComments(postId)
        setComments(prev => ({ ...prev, [postId]: data }))
      } catch (err) {
        setComments(prev => ({ ...prev, [postId]: [] }))
      } finally {
        setLoadingComments(false)
      }
    }
  }

  const handleSubmitComment = async (postId) => {
    const commentText = (commentTexts[postId] || '').trim()
    if (!commentText) return
    if (!user) {
      onLogin()
      return
    }
    try {
      const newComment = await addComment(postId, commentText)
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }))
      setCommentTexts(prev => ({ ...prev, [postId]: '' }))
      showToast('评论成功')
    } catch (err) {
      showToast('评论失败')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">交流区</h2>
      <p className="text-sm text-gray-400 mb-4">COMMUNICATION REGION</p>

      {/* 子标签切换 */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            activeSubTab === 'posts' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          💬 帖子
        </button>
        <button
          onClick={() => setActiveSubTab('nearby')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-1 ${
            activeSubTab === 'nearby' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Share size={16} />
          附近分享
        </button>
      </div>

      {/* 附近分享子页 */}
      {activeSubTab === 'nearby' && (
        <NearbyPage user={user} onLogin={onLogin} foods={foods} />
      )}

      {/* 帖子列表 */}
      {activeSubTab === 'posts' && (
        <>
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-cheese border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">暂无帖子</p>
          <p className="text-gray-400 text-sm mt-1">成为第一个发帖的人吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{post.avatar}</span>
                  <div>
                    <p className="font-medium text-gray-800">{post.author}</p>
                    <p className="text-xs text-gray-400">{post.time}</p>
                  </div>
                </div>
                {user && post.author === user.username && (
                  <div className="flex items-center gap-3">
                    {!post.isApi && (
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-gray-400 hover:text-cheese text-sm"
                      >
                        编辑
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(post)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-3">{post.content}</p>

              {/* 图片展示 */}
              {post.images && post.images.length > 0 && (
                <div className={`mb-3 grid gap-2 ${
                  post.images.length === 1 ? 'grid-cols-1' :
                  post.images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {post.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className={`relative ${post.images.length === 1 ? 'max-w-xs' : 'aspect-square'}`}>
                      <img
                        src={img}
                        alt={`图片${idx + 1}`}
                        className={`rounded-lg object-cover ${post.images.length === 1 ? 'max-h-48 w-auto' : 'w-full h-full'}`}
                      />
                    </div>
                  ))}
                </div>
              )}

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
                  onClick={() => handleExpandPost(post.id)}
                  className={`flex items-center gap-1 ${expandedPost === post.id ? 'text-cheese' : 'hover:text-cheese'}`}
                >
                  <span>💬</span>
                  <span>评论 {comments[post.id]?.length || 0}</span>
                </button>
              </div>

              {/* 评论区 */}
              {expandedPost === post.id && (
                <div className="mt-3 pt-3 border-t">
                  {loadingComments ? (
                    <p className="text-sm text-gray-400">加载评论...</p>
                  ) : (
                    <>
                      {comments[post.id]?.length > 0 ? (
                        <div className="space-y-3 mb-3">
                          {comments[post.id].map((c, i) => (
                            <div key={c.id || i} className="flex gap-2 text-sm">
                              <span className="shrink-0">{c.avatar || '🧀'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700">{c.username}</span>
                                  <span className="text-xs text-gray-400">
                                    {c.created_at ? formatRelativeTime(c.created_at) : '刚刚'}
                                  </span>
                                </div>
                                <p className="text-gray-600 mt-0.5 break-words">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-3">暂无评论</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder={user ? "写评论..." : "登录后评论"}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-cheese"
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                        />
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          className="px-3 py-1.5 bg-cheese text-gray-800 rounded-lg text-sm"
                        >
                          发送
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-cheese-light rounded-xl text-center">
        <p className="text-gray-800 flex items-center justify-center gap-2">
          <Lightbulb size={18} className="text-cheese" />
          分享你的食品管理经验
        </p>
      </div>

      <button
        onClick={handleAddClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-cheese text-gray-800 rounded-full shadow-lg hover:bg-cheese-dark active:scale-95 transition flex items-center justify-center"
        aria-label="发布动态"
      >
        <PenSquare size={24} />
      </button>

      {showCreateModal && user && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreatePost}
        />
      )}

      {editingPost && user && (
        <CreatePostModal
          user={user}
          editPost={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={handleUpdatePost}
        />
      )}

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

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toast}
        </div>
      )}
      </>
      )}
    </div>
  )
}
