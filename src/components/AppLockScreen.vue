<template>
  <div
    v-if="isLocked"
    class="lock-screen-overlay"
    :class="{ 'dark': isDark }"
  >
    <div class="lock-screen-content">
      <div class="lock-icon">
        <n-icon size="80">
          <LockClosed />
        </n-icon>
      </div>

      <h1 class="lock-title">系统已锁定</h1>
      <p class="lock-subtitle">请输入密码以继续使用系统</p>

      <n-form
        ref="formRef"
        :model="formData"
        :show-label="false"
        @submit.prevent="handleUnlock"
      >
        <n-form-item>
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password-on="click"
            @keyup.enter="handleUnlock"
            :focus="true"
            :maxlength="50"
            class="password-input"
          >
            <template #prefix>
              <n-icon>
                <Key />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            size="large"
            block
            @click="handleUnlock"
            :loading="isUnlocking"
            class="unlock-button"
          >
            解锁
          </n-button>
        </n-form-item>
      </n-form>

      <div v-if="showError" class="error-message">
        <n-icon color="#ff4d4f">
          <Warning />
        </n-icon>
        <span>密码错误，请重试</span>
      </div>

      <div class="lock-info">
        <n-text depth="3" style="font-size: 12px">
          XYZW 游戏管理系统 v1.0
        </n-text>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { NIcon, NInput, NButton, NForm, NFormItem, NText, useMessage } from 'naive-ui'
import { LockClosed, Key, Warning } from '@vicons/ionicons5'
import { useAppLock } from '@/composables/useAppLock'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
const { isLocked, unlock } = useAppLock()
const message = useMessage()

const formData = reactive({
  password: ''
})

const showError = ref(false)
const isUnlocking = ref(false)

const handleUnlock = async () => {
  if (!formData.password.trim()) {
    showError.value = true
    return
  }

  isUnlocking.value = true

  // 模拟验证延迟，提升用户体验
  await new Promise(resolve => setTimeout(resolve, 300))

  const success = unlock(formData.password)

  if (success) {
    message.success('解锁成功')
    showError.value = false
    formData.password = ''
  } else {
    showError.value = true
    message.error('密码错误')
    formData.password = ''

    // 3秒后隐藏错误提示
    setTimeout(() => {
      showError.value = false
    }, 3000)
  }

  isUnlocking.value = false
}

// 监听密码输入，隐藏错误提示
watch(() => formData.password, (newValue) => {
  if (newValue) {
    showError.value = false
  }
})

onMounted(() => {
  // 自动聚焦密码输入框
  setTimeout(() => {
    const input = document.querySelector('.password-input input')
    if (input) {
      input.focus()
    }
  }, 100)
})
</script>

<style scoped>
.lock-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.lock-screen-overlay.dark {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.lock-screen-content {
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.dark .lock-screen-content {
  background: rgba(45, 55, 72, 0.95);
  color: #ffffff;
}

.lock-icon {
  margin-bottom: 24px;
  color: #667eea;
}

.dark .lock-icon {
  color: #a0aec0;
}

.lock-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2d3748;
}

.dark .lock-title {
  color: #ffffff;
}

.lock-subtitle {
  font-size: 14px;
  color: #718096;
  margin-bottom: 32px;
}

.dark .lock-subtitle {
  color: #cbd5e0;
}

.password-input {
  margin-bottom: 16px;
}

.unlock-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.unlock-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.unlock-button:active {
  transform: translateY(0);
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  color: #ff4d4f;
  font-size: 14px;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.lock-info {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .lock-info {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .lock-screen-content {
    padding: 24px;
  }

  .lock-title {
    font-size: 24px;
  }

  .lock-subtitle {
    font-size: 13px;
  }
}

/* 深色主题下的输入框样式 */
:deep(.dark .n-input) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

:deep(.dark .n-input__input) {
  color: #ffffff !important;
}

:deep(.dark .n-input__placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>