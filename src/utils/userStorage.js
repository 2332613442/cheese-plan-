// 用户数据存储

const USER_KEY = 'cheese-plan-user'

// 获取当前用户
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('读取用户数据失败:', error)
    return null
  }
}

// 设置当前用户（登录/注册）
export function setCurrentUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return true
  } catch (error) {
    console.error('保存用户数据失败:', error)
    return false
  }
}

// 清除用户（退出登录）
export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('清除用户数据失败:', error)
  }
}

// 创建新用户
export function createUser(username, avatar) {
  const user = {
    id: crypto.randomUUID(),
    username,
    avatar,
    level: 1,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  }
  setCurrentUser(user)
  return user
}

// 更新用户信息
export function updateUser(updates) {
  const user = getCurrentUser()
  if (!user) return null

  const updatedUser = {
    ...user,
    ...updates,
    lastLoginAt: new Date().toISOString(),
  }
  setCurrentUser(updatedUser)
  return updatedUser
}

// 可选头像列表
export const avatarOptions = [
  '🧀', '🐭', '🐹', '🦊', '🐱', '🐶',
  '🐰', '🐻', '🐼', '🐨', '🦁', '🐯',
]
