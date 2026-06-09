// 食品消耗记录存储

import { generateUUID } from './uuid'

const CONSUMPTION_KEY = 'cheese-plan-consumption'

// 获取所有消耗记录
export function getConsumptionRecords() {
  try {
    const data = localStorage.getItem(CONSUMPTION_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取消耗记录失败:', error)
    return []
  }
}

// 保存消耗记录
function saveConsumptionRecords(records) {
  try {
    localStorage.setItem(CONSUMPTION_KEY, JSON.stringify(records))
    return true
  } catch (error) {
    console.error('保存消耗记录失败:', error)
    return false
  }
}

// 添加消耗记录
export function addConsumption(food) {
  const records = getConsumptionRecords()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expirationDate = new Date(food.expirationDate)

  const newRecord = {
    id: generateUUID(),
    food: {
      id: food.id,
      name: food.name,
      category: food.category,
      expirationDate: food.expirationDate,
    },
    consumedAt: new Date().toISOString(),
    wasExpired: expirationDate < today, // 消耗时是否已过期
  }

  records.unshift(newRecord)
  saveConsumptionRecords(records)
  return newRecord
}

// 获取消耗统计
export function getConsumptionStats() {
  const records = getConsumptionRecords()
  const total = records.length
  const expired = records.filter(r => r.wasExpired).length
  const fresh = total - expired

  // 计算节省金额（未过期消耗的按30元/件估算）
  const savedAmount = fresh * 30

  // 本月消耗
  const now = new Date()
  const thisMonth = records.filter(r => {
    const date = new Date(r.consumedAt)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  return {
    total,
    expired,
    fresh,
    savedAmount,
    thisMonth,
  }
}

// 获取最近消耗记录
export function getRecentConsumption(limit = 10) {
  return getConsumptionRecords().slice(0, limit)
}
