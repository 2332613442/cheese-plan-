// 帖子数据存储

import { generateUUID } from './uuid'

const POSTS_KEY = 'cheese-plan-posts'
const LIKED_KEY = 'cheese-plan-liked-posts'

// 获取所有帖子
export function getPosts() {
  try {
    const data = localStorage.getItem(POSTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取帖子数据失败:', error)
    return []
  }
}

// 保存帖子列表
function savePosts(posts) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
    return true
  } catch (error) {
    console.error('保存帖子数据失败:', error)
    return false
  }
}

// 获取已点赞的帖子ID列表
export function getLikedPosts() {
  try {
    const data = localStorage.getItem(LIKED_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    return []
  }
}

// 保存已点赞列表
function saveLikedPosts(liked) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(liked))
  } catch (error) {
    console.error('保存点赞数据失败:', error)
  }
}

// 追加一条已点赞记录（仅存ID，不修改帖子数据，适用于API帖子）
export function addLikedPost(postId) {
  const liked = getLikedPosts()
  if (!liked.includes(postId)) {
    liked.push(postId)
    saveLikedPosts(liked)
  }
}

// 检查是否已点赞
export function hasLiked(postId) {
  const liked = getLikedPosts()
  return liked.includes(postId)
}

// 添加新帖子
export function addPost(post) {
  const posts = getPosts()
  const newPost = {
    id: generateUUID(),
    ...post,
    likes: 0,
    createdAt: new Date().toISOString(),
  }
  posts.unshift(newPost)
  savePosts(posts)
  return newPost
}

// 点赞帖子
export function likePost(postId) {
  // 检查是否已点赞
  if (hasLiked(postId)) {
    return false
  }

  // 更新帖子点赞数
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (post) {
    post.likes += 1
    savePosts(posts)
  }

  // 记录已点赞
  const liked = getLikedPosts()
  liked.push(postId)
  saveLikedPosts(liked)

  return true
}

// 删除帖子
export function deletePost(postId) {
  const posts = getPosts()
  const filtered = posts.filter(p => p.id !== postId)
  savePosts(filtered)
}
