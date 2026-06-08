// 保质期时长分类配置

export const EXPIRED_RANGE = [-9999, 0]

export const TIME_RANGES = [
  {
    id: 'urgent',
    label: '急需处理',
    cheeseType: null,
    range: EXPIRED_RANGE,
    color: 'bg-red-100 border-red-300',
  },
  {
    id: 'week',
    label: '一周内',
    cheeseType: 'week',
    range: [1, 7],
    color: 'bg-orange-100 border-orange-300',
  },
  {
    id: 'month',
    label: '1个月内',
    cheeseType: 'month',
    range: [8, 30],
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    id: 'quarter',
    label: '1~3个月',
    cheeseType: 'quarter',
    range: [31, 90],
    color: 'bg-lime-100 border-lime-300',
  },
  {
    id: 'half',
    label: '3~6个月',
    cheeseType: 'half',
    range: [91, 180],
    color: 'bg-green-100 border-green-300',
  },
  {
    id: 'year',
    label: '6~12个月',
    cheeseType: 'year',
    range: [181, 365],
    color: 'bg-teal-100 border-teal-300',
  },
  {
    id: 'long',
    label: '1年及以上',
    cheeseType: 'long',
    range: [366, Infinity],
    color: 'bg-blue-100 border-blue-300',
  },
]

// 根据range获取标签
export function getRangeLabel(range) {
  if (!range) return null
  const key = `${range[0]},${range[1]}`
  const found = TIME_RANGES.find(t => `${t.range[0]},${t.range[1]}` === key)
  return found?.label || `${range[0]}-${range[1]}天`
}
