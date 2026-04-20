const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')

async function extractIcons() {
  const inputPath = '/Users/jyxc-dz-0100661/Desktop/奶酪块.png'
  const outputDir = path.join(__dirname, '../design')

  const image = await loadImage(inputPath)
  console.log(`原始图片尺寸: ${image.width} x ${image.height}`)

  // 手动测量每个图标的精确位置 (基于1536x1024图片)
  // 格式: { x, y, w, h } 为源图中的实际像素位置
  const icons = [
    { name: 'cheese-month', x: 85, y: 175, w: 340, h: 390, label: '立方奶酪' },
    { name: 'cheese-quarter', x: 555, y: 120, w: 280, h: 420, label: '三角形奶酪' },
    { name: 'cheese-half', x: 1030, y: 100, w: 430, h: 430, label: '大立方奶酪' },
    { name: 'cheese-year', x: 55, y: 540, w: 440, h: 440, label: '扁平三角奶酪' },
    { name: 'cheese-long', x: 520, y: 530, w: 530, h: 450, label: '大扁平奶酪' },
    { name: 'cheese-week', x: 1185, y: 620, w: 240, h: 290, label: '小奶酪块' },
  ]

  // 统一输出尺寸
  const outputSize = 400

  for (const icon of icons) {
    const canvas = createCanvas(outputSize, outputSize)
    const ctx = canvas.getContext('2d')

    // 透明背景
    ctx.clearRect(0, 0, outputSize, outputSize)

    // 等比缩放并居中
    const scale = Math.min(outputSize / icon.w, outputSize / icon.h) * 0.85
    const scaledW = icon.w * scale
    const scaledH = icon.h * scale
    const offsetX = (outputSize - scaledW) / 2
    const offsetY = (outputSize - scaledH) / 2

    ctx.drawImage(
      image,
      icon.x, icon.y, icon.w, icon.h,
      offsetX, offsetY, scaledW, scaledH
    )

    const outputPath = path.join(outputDir, `${icon.name}.png`)
    fs.writeFileSync(outputPath, canvas.toBuffer('image/png'))
    console.log(`已保存: ${icon.name}.png (${icon.label})`)
  }

  console.log('\n所有图标已保存到:', outputDir)
}

extractIcons().catch(console.error)
