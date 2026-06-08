// Web Notification API 封装

import { getReminderSchedule, getSettings } from './settingsStorage'

const NOTIFIED_KEY = 'cheese-plan-notified-foods'
const DAILY_SUMMARY_KEY = 'cheese-plan-daily-summary'
const BASE_URL = import.meta.env.BASE_URL || '/'

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
    icon: `${BASE_URL}images/cheese-logo.png`,
    badge: `${BASE_URL}images/cheese-logo.png`,
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
  // 只有在权限允许且用户开启通知时才执行
  if (Notification.permission !== 'granted') {
    return
  }

  const { notificationEnabled } = getSettings()
  if (notificationEnabled === false) {
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
        if (daysRemaining === 1) {
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

// 获取今日日期字符串
function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

// 检查今日是否已发送摘要
function hasSentDailySummary() {
  const lastSent = localStorage.getItem(DAILY_SUMMARY_KEY)
  return lastSent === getTodayString()
}

// 标记今日已发送摘要
function markDailySummarySent() {
  localStorage.setItem(DAILY_SUMMARY_KEY, getTodayString())
}

// 发送每日摘要通知
export function sendDailySummary(foods) {
  if (Notification.permission !== 'granted') {
    return false
  }

  const { notificationEnabled } = getSettings()
  if (notificationEnabled === false) {
    return false
  }

  // 今日已发送则跳过
  if (hasSentDailySummary()) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 统计各类食品数量
  let expiredToday = 0
  let expiringIn3Days = 0
  let expiringIn7Days = 0

  foods.forEach((food) => {
    const expirationDate = new Date(food.expirationDate)
    expirationDate.setHours(0, 0, 0, 0)
    const diffTime = expirationDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysRemaining === 0) {
      expiredToday++
    } else if (daysRemaining > 0 && daysRemaining <= 3) {
      expiringIn3Days++
    } else if (daysRemaining > 3 && daysRemaining <= 7) {
      expiringIn7Days++
    }
  })

  // 没有需要提醒的食品则跳过
  if (expiredToday === 0 && expiringIn3Days === 0 && expiringIn7Days === 0) {
    markDailySummarySent()
    return false
  }

  // 构建摘要消息
  const parts = []
  if (expiredToday > 0) {
    parts.push(`${expiredToday}件今日到期`)
  }
  if (expiringIn3Days > 0) {
    parts.push(`${expiringIn3Days}件3天内到期`)
  }
  if (expiringIn7Days > 0) {
    parts.push(`${expiringIn7Days}件7天内到期`)
  }

  sendNotification('每日食品摘要', {
    body: parts.join('，') + '，请及时处理',
    tag: 'daily-summary',
  })

  markDailySummarySent()
  return true
}
