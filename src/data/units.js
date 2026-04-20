// 数量单位配置

export const units = [
  { id: 'piece', name: '个' },
  { id: 'bottle', name: '瓶' },
  { id: 'bag', name: '袋' },
  { id: 'box', name: '盒' },
  { id: 'pack', name: '包' },
  { id: 'can', name: '罐' },
  { id: 'jin', name: '斤' },
  { id: 'gram', name: '克' },
  { id: 'ml', name: '毫升' },
]

export const getUnitById = (id) => {
  return units.find(u => u.id === id) || units[0]
}

export const getUnitName = (id) => {
  const unit = getUnitById(id)
  return unit ? unit.name : '个'
}
