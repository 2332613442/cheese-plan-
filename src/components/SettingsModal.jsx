import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { getSettings, saveSettings } from '../utils/settingsStorage'

const reminderOptions = [
  { value: 1, label: '1天' },
  { value: 3, label: '3天' },
  { value: 5, label: '5天' },
  { value: 7, label: '7天' },
  { value: 14, label: '14天' },
  { value: 30, label: '30天' },
]

const scheduleOptions = [
  { value: 1, label: '1天前' },
  { value: 3, label: '3天前' },
  { value: 5, label: '5天前' },
  { value: 7, label: '7天前' },
  { value: 14, label: '14天前' },
]

export default function SettingsModal({ onClose, onSave }) {
  const [settings, setSettings] = useState(getSettings)

  const handleSave = () => {
    saveSettings(settings)
    onSave && onSave(settings)
    onClose()
  }

  const toggleScheduleDay = (day) => {
    const current = settings.reminderSchedule || []
    if (current.includes(day)) {
      setSettings({
        ...settings,
        reminderSchedule: current.filter(d => d !== day).sort((a, b) => b - a)
      })
    } else {
      setSettings({
        ...settings,
        reminderSchedule: [...current, day].sort((a, b) => b - a)
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="关闭弹窗"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* 通知开关 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">临期提醒通知</p>
              <p className="text-xs text-gray-500 mt-0.5">开启后在食品到期前发送通知</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notificationEnabled: !settings.notificationEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.notificationEnabled !== false ? 'bg-cheese' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.notificationEnabled !== false ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* 临期阈值设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              临期阈值
            </label>
            <p className="text-xs text-gray-500 mb-3">
              到期前多少天标记为"临期"状态
            </p>
            <div className="grid grid-cols-3 gap-2">
              {reminderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, reminderDays: option.value })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    settings.reminderDays === option.value
                      ? 'bg-cheese text-gray-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 多次提醒设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提醒时间（可多选）
            </label>
            <p className="text-xs text-gray-500 mb-3">
              在以下时间点发送提醒通知
            </p>
            <div className="flex flex-wrap gap-2">
              {scheduleOptions.map((option) => {
                const isSelected = (settings.reminderSchedule || []).includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleScheduleDay(option.value)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cheese text-gray-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 当前设置说明 */}
          <div className="bg-cheese-light rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-2">
              当前设置：
            </p>
            <p className="text-sm text-gray-600">
              · 到期前 <span className="font-bold text-cheese">{settings.reminderDays}</span> 天标记为临期
            </p>
            <p className="text-sm text-gray-600">
              · 提醒时间：{(settings.reminderSchedule || []).length > 0
                ? (settings.reminderSchedule || []).map(d => `${d}天前`).join('、')
                : '未设置'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
