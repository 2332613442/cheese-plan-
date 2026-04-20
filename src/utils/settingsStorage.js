// 用户设置存储

const SETTINGS_KEY = 'cheese-plan-settings'

// 默认设置
const defaultSettings = {
  reminderDays: 7, // 临期阈值（用于状态计算）
  reminderSchedule: [7, 3, 1], // 多次提醒时间点（天数）
  notificationEnabled: true, // 是否开启通知
}

// 获取设置
export function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) }
    }
    return defaultSettings
  } catch (error) {
    console.error('读取设置失败:', error)
    return defaultSettings
  }
}

// 保存设置
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('保存设置失败:', error)
    return false
  }
}

// 更新单个设置项
export function updateSetting(key, value) {
  const settings = getSettings()
  settings[key] = value
  return saveSettings(settings)
}

// 获取提醒天数（临期阈值）
export function getReminderDays() {
  return getSettings().reminderDays
}

// 设置提醒天数
export function setReminderDays(days) {
  return updateSetting('reminderDays', days)
}

// 获取提醒时间表
export function getReminderSchedule() {
  return getSettings().reminderSchedule
}

// 设置提醒时间表
export function setReminderSchedule(schedule) {
  return updateSetting('reminderSchedule', schedule)
}
