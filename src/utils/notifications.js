// Web Notification API 封装

import { getReminderSchedule } from './settingsStorage'

const NOTIFIED_KEY = 'cheese-plan-notified-foods'

// 请求通知权限
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知功能')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 检查通知权限状态
export function checkNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

// 发送通知
export function sendNotification(title, options = {}) {
  if (Notification.permission !== 'granted') {
    return null
  }

  return new Notification(title, {
    icon: '/images/cheese-logo.png',
    badge: '/images/cheese-logo.png',
    ...options,
  })
}

// 获取已通知的食品记录
// 格式: { foodId: { day7: timestamp, day3: timestamp, day1: timestamp } }
function getNotifiedFoods() {
  const data = localStorage.getItem(NOTIFIED_KEY)
  return data ? JSON.parse(data) : {}
}

// 保存已通知的食品记录
function saveNotifiedFoods(notified) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified))
}

// 检查某食品在某天数是否已通知
function hasNotifiedForDay(notified, foodId, day) {
  return notified[foodId] && notified[foodId][`day${day}`]
}

// 标记食品在某天数已通知
function markAsNotifiedForDay(foodId, day) {
  const notified = getNotifiedFoods()
  if (!notified[foodId]) {
    notified[foodId] = {}
  }
  notified[foodId][`day${day}`] = new Date().toISOString()
  saveNotifiedFoods(notified)
}

// 清理过期的通知记录（超过30天）
function cleanOldNotifications() {
  const notified = getNotifiedFoods()
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  const cleaned = {}
  Object.entries(notified).forEach(([foodId, days]) => {
    const validDays = {}
    Object.entries(days).forEach(([dayKey, time]) => {
      if (now - new Date(time).getTime() < thirtyDays) {
        validDays[dayKey] = time
      }
    })
    if (Object.keys(validDays).length > 0) {
      cleaned[foodId] = validDays
    }
  })

  saveNotifiedFoods(cleaned)
}

// 检查临期食品并发送通知
export function checkExpiringFoods(foods) {
  // 只有在权限允许时才执行
  if (Notification.permission !== 'granted') {
    return
  }

  // 清理旧记录
  cleanOldNotifications()

  const notified = getNotifiedFoods()
  const schedule = getReminderSchedule()

  foods.forEach((food) => {
    // 计算剩余天数
    const expirationDate = new Date(food.expirationDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expirationDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 已过期或没有提醒计划则跳过
    if (daysRemaining <= 0 || schedule.length === 0) {
      return
    }

    // 检查是否到达某个提醒时间点
    schedule.forEach((reminderDay) => {
      // 只在恰好等于或小于提醒天数时发送（且大于0）
      if (daysRemaining <= reminderDay && daysRemaining > 0) {
        // 检查此天数是否已通知过
        if (hasNotifiedForDay(notified, food.id, reminderDay)) {
          return
        }

        // 发送通知
        let message
        if (daysRemaining === 0) {
          message = `${food.name} 今天到期，请及时处理！`
        } else if (daysRemaining === 1) {
          message = `${food.name} 明天到期，请及时处理！`
        } else {
          message = `${food.name} 将在 ${daysRemaining} 天后过期，请及时处理`
        }

        sendNotification('临期提醒', {
          body: message,
          tag: `expiring-${food.id}-day${reminderDay}`,
        })

        // 标记为已通知
        markAsNotifiedForDay(food.id, reminderDay)
      }
    })
  })
}
