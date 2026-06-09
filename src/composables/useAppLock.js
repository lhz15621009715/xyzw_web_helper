import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// 应用锁状态管理（单例模式）
const isLocked = ref(false)
const STORAGE_KEY = 'app_unlocked'
const PASSWORD_HASH_KEY = 'app_password_hash'

// 简单的哈希函数（用于密码存储）
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

// 验证密码
const validatePassword = (inputPassword) => {
  return inputPassword === 'lhz123456'
}

// 获取存储的密码哈希
const getStoredPasswordHash = () => {
  return localStorage.getItem(PASSWORD_HASH_KEY)
}

// 存储密码哈希
const storePasswordHash = () => {
  const hash = simpleHash('lhz123456')
  localStorage.setItem(PASSWORD_HASH_KEY, hash)
}

// 检查是否已解锁
const checkUnlockedStatus = () => {
  const unlocked = localStorage.getItem(STORAGE_KEY)
  const storedHash = getStoredPasswordHash()

  // 如果有解锁记录且有密码哈希，则视为已解锁
  if (unlocked === 'true' && storedHash) {
    isLocked.value = false
    return true
  }

  isLocked.value = true
  return false
}

// 验证并解锁
const unlock = (password) => {
  if (validatePassword(password)) {
    // 存储密码哈希
    storePasswordHash()
    // 标记为已解锁
    localStorage.setItem(STORAGE_KEY, 'true')
    isLocked.value = false
    return true
  }
  return false
}

// 锁定应用
const lock = () => {
  isLocked.value = true
  localStorage.setItem(STORAGE_KEY, 'false')
}

export function useAppLock() {
  // 初始化时检查解锁状态
  if (isLocked.value === false) {
    checkUnlockedStatus()
  }

  return {
    isLocked: computed(() => isLocked.value),
    unlock,
    lock,
    checkUnlockedStatus,
    validatePassword
  }
}