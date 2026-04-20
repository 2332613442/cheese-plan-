// 分享平台服务
import { supabase } from './supabase'

// 创建分享
export async function createShare(shareData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('shares')
    .insert({
      user_id: user.id,
      title: shareData.title,
      description: shareData.description,
      foods: shareData.foods,
      images: shareData.images || [],
      location_lat: shareData.location?.lat,
      location_lng: shareData.location?.lng,
      location_text: shareData.location?.text,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 获取所有可领取的分享
export async function getAvailableShares() {
  const { data, error } = await supabase
    .from('shares')
    .select(`
      *,
      profiles:user_id (username, avatar)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 获取附近的分享（按距离排序）
export async function getNearbyShares(lat, lng, radiusKm = 10) {
  // 简单的边界框查询（不是精确距离）
  const latRange = radiusKm / 111 // 1度约111km
  const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

  const { data, error } = await supabase
    .from('shares')
    .select(`
      *,
      profiles:user_id (username, avatar)
    `)
    .eq('status', 'available')
    .gte('location_lat', lat - latRange)
    .lte('location_lat', lat + latRange)
    .gte('location_lng', lng - lngRange)
    .lte('location_lng', lng + lngRange)
    .order('created_at', { ascending: false })

  if (error) throw error

  // 计算实际距离并排序
  return data.map(share => ({
    ...share,
    distance: calculateDistance(lat, lng, share.location_lat, share.location_lng)
  })).sort((a, b) => a.distance - b.distance)
}

// 计算两点之间的距离（公里）
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat2 || !lng2) return null
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 获取单个分享详情
export async function getShareById(shareId) {
  const { data, error } = await supabase
    .from('shares')
    .select(`
      *,
      profiles:user_id (username, avatar),
      claimer:claimed_by (username, avatar)
    `)
    .eq('id', shareId)
    .single()

  if (error) throw error
  return data
}

// 领取分享
export async function claimShare(shareId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('shares')
    .update({
      status: 'claimed',
      claimed_by: user.id,
      claimed_at: new Date().toISOString()
    })
    .eq('id', shareId)
    .eq('status', 'available') // 确保还是可领取状态
    .select()
    .single()

  if (error) throw error
  return data
}

// 确认完成分享
export async function completeShare(shareId) {
  const { data, error } = await supabase
    .from('shares')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', shareId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 取消分享
export async function cancelShare(shareId) {
  const { data, error } = await supabase
    .from('shares')
    .update({ status: 'cancelled' })
    .eq('id', shareId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 获取我发布的分享
export async function getMyShares() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 获取我领取的分享
export async function getMyClaimedShares() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('shares')
    .select(`
      *,
      profiles:user_id (username, avatar)
    `)
    .eq('claimed_by', user.id)
    .order('claimed_at', { ascending: false })

  if (error) throw error
  return data
}

// 发送消息
export async function sendMessage(shareId, toUserId, content) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      share_id: shareId,
      from_user: user.id,
      to_user: toUserId,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 获取分享相关的消息
export async function getShareMessages(shareId) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:from_user (username, avatar),
      receiver:to_user (username, avatar)
    `)
    .eq('share_id', shareId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// 获取我的未读消息数
export async function getUnreadMessageCount() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user', user.id)
    .is('read_at', null)

  if (error) return 0
  return count
}

// 标记消息为已读
export async function markMessageAsRead(messageId) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) throw error
}

// 订阅新分享
export function subscribeToShares(callback) {
  return supabase
    .channel('shares')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'shares'
    }, callback)
    .subscribe()
}

// 订阅新消息
export function subscribeToMessages(userId, callback) {
  return supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_user=eq.${userId}`
    }, callback)
    .subscribe()
}
