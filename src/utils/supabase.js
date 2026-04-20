import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqrmokzefqjvcdegpoaz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxcm1va3plZnFqdmNkZWdwb2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Nzc2NDAsImV4cCI6MjA5MjI1MzY0MH0.b0KG-NxzHpVQAqkthO4uYR8BoZyhbki_Z0N6K5b-tms'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户相关
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 监听认证状态变化
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
