import { createCanvas } from 'canvas'
import * as fs from 'fs'
import * as path from 'path'
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf.js'
import { TextItem } from 'pdfjs-dist/types/src/display/api'

const source = path.join(__dirname, '../bruno.pdf')
const dest = path.join(__dirname, '../output')

console.log('source', source)
console.log('dest', dest)

const start = async () => {
  console.log('start')

  try {
    const doc = await PDFJS.getDocument({ url: source }).promise
    const page = await doc.getPage(2)

    const viewport = page.getViewport()

    console.log('viewport', viewport)
    viewport.transform = [1, 0, 0, 1, 0, 0]
    viewport.scale = 1
    viewport.width = viewport.viewBox[2]
    viewport.height = viewport.viewBox[3]
    viewport.rotation = 0
    console.log('viewport', viewport)

    const canvas = createCanvas(viewport.width, viewport.height)
    const canvasContext = canvas.getContext('2d')

    const renderContext = {
      canvasContext,
      viewport,
    }

    // fix orientation
    canvasContext.translate(canvas.width / 2, canvas.height / 2)
    canvasContext.rotate((180 * Math.PI) / 180)
    canvasContext.translate(-canvas.width / 2, -canvas.height / 2)

    // mirror
    canvasContext.translate(viewport.width, 0)
    canvasContext.scale(-1, 1)

    await page.render(renderContext).promise

    fs.writeFileSync('out.png', canvas.toBuffer('image/png'))

    const result = (await page.getTextContent()).items.map((o) => (o as TextItem).str).join('')
    console.log('result', result)
  } catch (err) {
    console.error('ERROR', err)
  }

  // await new Promise((r) => setTimeout(r, 22000))
}

start()
