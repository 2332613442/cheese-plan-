import { getReminderDays } from './settingsStorage'
import { generateUUID } from './uuid'

export const calculateExpirationDate = (productionDate, shelfLifeDays) => {
  const date = new Date(productionDate)
  date.setDate(date.getDate() + shelfLifeDays)
  return date.toISOString().split('T')[0]
}

export const calculateStatus = (expirationDate, warningDays = null) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expDate = new Date(expirationDate)
  expDate.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))

  // 使用传入的阈值或从设置读取
  const threshold = warningDays !== null ? warningDays : getReminderDays()

  if (diffDays <= 0) {
    return 'expired'
  } else if (diffDays <= threshold) {
    return 'warning'
  } else {
    return 'normal'
  }
}

export const getStatusInfo = (status) => {
  const statusMap = {
    normal: { label: '正常', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
    warning: { label: '临期', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
    expired: { label: '已过期', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
  }
  return statusMap[status] || statusMap.normal
}

export const getDaysRemaining = (expirationDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expDate = new Date(expirationDate)
  expDate.setHours(0, 0, 0, 0)

  return Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
}

export const createFood = (name, productionDate, shelfLifeDays, category, options = {}) => {
  const expirationDate = calculateExpirationDate(productionDate, shelfLifeDays)
  const now = new Date().toISOString()

  return {
    id: generateUUID(),
    name,
    barcode: options.barcode || '',
    category,
    productionDate,
    shelfLifeDays,
    expirationDate,
    quantity: options.quantity || 1,
    unit: options.unit || 'piece',
    image: options.image || null,
    status: calculateStatus(expirationDate),
    createdAt: now,
    updatedAt: now,
  }
}
