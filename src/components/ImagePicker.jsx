import { useRef } from 'react'

// 压缩图片
async function compressImage(file, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 等比缩放
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let dataUrl = canvas.toDataURL('image/jpeg', quality)

        // 如果压缩后仍超过 100KB，降低质量再压一次
        if (dataUrl.length > 100 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.4)
        }

        // 超过 200KB 则拒绝（防止 localStorage 溢出）
        if (dataUrl.length > 200 * 1024) {
          reject(new Error('图片过大，请选择更小的图片'))
          return
        }

        resolve(dataUrl)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ImagePicker({ value, onChange }) {
  const inputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 压缩图片
    try {
      const compressed = await compressImage(file)
      onChange(compressed)
    } catch (err) {
      alert(err.message || '图片处理失败，请选择更小的图片')
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="food-image-input"
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="食品照片"
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-sm hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          htmlFor="food-image-input"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cheese transition"
        >
          <span className="text-3xl mb-1">📷</span>
          <span className="text-sm text-gray-500">点击拍照或选择图片</span>
        </label>
      )}
    </div>
  )
}
