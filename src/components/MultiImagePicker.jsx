import { useRef } from 'react'
import { X, Camera, Plus } from 'lucide-react'

const MAX_IMAGES = 4

// 压缩图片
async function compressImage(file, maxWidth = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let dataUrl = canvas.toDataURL('image/jpeg', quality)

        // 如果压缩后仍超过 150KB，降低质量再压一次
        if (dataUrl.length > 150 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.4)
        }

        // 超过 200KB 则拒绝
        if (dataUrl.length > 200 * 1024) {
          reject(new Error('图片过大，请选择更小的图片'))
          return
        }

        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export default function MultiImagePicker({ images = [], onChange, maxCount = MAX_IMAGES }) {
  const inputRef = useRef(null)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 检查数量限制
    const remaining = maxCount - images.length
    if (remaining <= 0) {
      alert(`最多上传${maxCount}张图片`)
      return
    }

    const filesToProcess = files.slice(0, remaining)

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        continue
      }

      try {
        const compressed = await compressImage(file)
        onChange([...images, compressed])
        images = [...images, compressed] // 更新本地引用以支持多张连续添加
      } catch (err) {
        alert(err.message || '图片处理失败')
      }
    }

    // 清空 input 以支持重复选择同一文件
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const canAddMore = images.length < maxCount

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="post-images-input"
      />

      {images.length === 0 ? (
        // 空状态：显示大的上传区域
        <label
          htmlFor="post-images-input"
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-cheese transition"
        >
          <Camera size={28} className="text-gray-400 mb-1" />
          <span className="text-sm text-gray-500">添加图片（最多{maxCount}张）</span>
        </label>
      ) : (
        // 有图片：显示网格
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={img}
                alt={`图片${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                aria-label="移除图片"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* 添加更多按钮 */}
          {canAddMore && (
            <label
              htmlFor="post-images-input"
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cheese transition flex items-center justify-center"
            >
              <Plus size={24} className="text-gray-400" />
            </label>
          )}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">
          {images.length}/{maxCount} 张图片
        </p>
      )}
    </div>
  )
}
