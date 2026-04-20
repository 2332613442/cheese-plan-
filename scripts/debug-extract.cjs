const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')

async function debugExtract() {
  const inputPath = path.join(__dirname, '../design/奶酪块.png')
  const outputDir = path.join(__dirname, '../public/images/debug')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const image = await loadImage(inputPath)
  console.log(`原始图片尺寸: ${image.width} x ${image.height}`)

  // 按均匀网格提取6个单元格（无缩放，原始尺寸）
  const cols = 3
  const rows = 2
  const cellW = Math.floor(image.width / cols)   // 204
  const cellH = Math.floor(image.height / rows)  // 204

  console.log(`单元格尺寸: ${cellW} x ${cellH}`)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const canvas = createCanvas(cellW, cellH)
      const ctx = canvas.getContext('2d')

      const sx = col * cellW
      const sy = row * cellH

      ctx.drawImage(image, sx, sy, cellW, cellH, 0, 0, cellW, cellH)

      const name = `cell_${col}_${row}.png`
      const outputPath = path.join(outputDir, name)
      fs.writeFileSync(outputPath, canvas.toBuffer('image/png'))

      console.log(`已提取: ${name} - 区域 [${sx},${sy},${cellW},${cellH}]`)
    }
  }
}

debugExtract().catch(console.error)
