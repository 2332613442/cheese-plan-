const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// 获取存储的 token
const getToken = () => localStorage.getItem('cheese-token')

// 保存 token
export const setToken = (token) => localStorage.setItem('cheese-token', token)

// 清除 token
export const clearToken = () => localStorage.removeItem('cheese-token')

// 通用请求方法
const request = async (path, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '请求失败')
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('请求超时，请检查网络')
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

// 用户注册
export const register = (username, password, avatar) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, avatar }),
  })

// 用户登录
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

// 获取分享列表
export const getShares = () => request('/shares')

// 发布分享
export const createShare = (title, foods, options = {}) =>
  request('/shares', {
    method: 'POST',
    body: JSON.stringify({
      title,
      foods,
      description: options.description,
      location: options.location,
      contact: options.contact,
      pickup_time: options.pickup_time,
    }),
  })

// 获取分享详情
export const getShareDetail = (id) => request(`/shares/${id}`)

// 领取分享
export const claimShare = (id) =>
  request(`/shares/${id}/claim`, { method: 'POST' })

// 完成分享
export const completeShare = (id) =>
  request(`/shares/${id}/complete`, { method: 'POST' })

// 取消分享
export const cancelShare = (id) =>
  request(`/shares/${id}/cancel`, { method: 'POST' })

// 获取分享消息
export const getShareMessages = (shareId) =>
  request(`/shares/${shareId}/messages`)

// 发送分享消息
export const sendShareMessage = (shareId, content) =>
  request(`/shares/${shareId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })

// 获取帖子列表
export const getPosts = () => request('/posts')

// 发布帖子
export const createPost = (content, images = []) =>
  request('/posts', {
    method: 'POST',
    body: JSON.stringify({ content, images }),
  })

// 点赞帖子
export const likePost = (id) =>
  request(`/posts/${id}/like`, { method: 'POST' })

// 获取帖子评论
export const getComments = (postId) =>
  request(`/comments/post/${postId}`)

// 发表评论
export const addComment = (postId, content) =>
  request(`/comments/post/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })

// 获取云端食品
export const getCloudFoods = () => request('/foods')

// 同步食品到云端
export const syncFoods = (foods) =>
  request('/foods/sync', {
    method: 'POST',
    body: JSON.stringify({ foods }),
  })

// 添加云端食品
export const addCloudFood = (food) =>
  request('/foods', {
    method: 'POST',
    body: JSON.stringify({
      name: food.name,
      category: food.category,
      production_date: food.productionDate,
      expiration_date: food.expirationDate,
      quantity: food.quantity,
      unit: food.unit,
      barcode: food.barcode,
      image: food.image,
    }),
  })

// 删除云端食品
export const deleteCloudFood = (id) =>
  request(`/foods/${id}`, { method: 'DELETE' })
