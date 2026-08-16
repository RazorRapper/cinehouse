import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'C:\\Users\\keshr\\Desktop\\kunal exercise\\cinehouse\\screenshots'
mkdirSync(OUT, { recursive: true })

const errors = []
const requests = []

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  geolocation: { latitude: 12.9716, longitude: 77.5946 }, // Bengaluru
  permissions: ['geolocation'],
})
const page = await context.newPage()

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))
page.on('request', (req) => {
  const url = req.url()
  if (url.includes('themoviedb.org')) requests.push(`DIRECT-TMDB-CALL: ${url}`)
})

const shot = async (name) => {
  await page.screenshot({ path: `${OUT}\\live-${name}.png` })
  console.log('shot:', name)
}

const LIVE = 'https://cinehouse-taupe.vercel.app'

await page.goto(LIVE, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Now Showing', { timeout: 15000 })
await page.waitForTimeout(1000)
await shot('01-home-real-movies')

// Search test
await page.fill('input[placeholder="Search movies"]', 'spider')
await page.waitForTimeout(600)
await shot('02-search')

// Clear search, go into a real movie
await page.fill('input[placeholder="Search movies"]', '')
await page.waitForTimeout(400)
await page.click('.font-display:has-text("Spider")')
await page.waitForSelector('text=Book Tickets', { timeout: 15000 })
await page.waitForTimeout(800)
await shot('03-movie-detail')

await page.click('text=Book Tickets')
await page.waitForSelector('text=Cinemas near', { timeout: 15000 })
await page.waitForTimeout(2000)
await shot('04-select-cinema')

console.log('CONSOLE ERRORS:', errors.length ? errors : 'none')
console.log('DIRECT TMDB CALLS FROM BROWSER:', requests.length ? requests : 'none (good)')

await browser.close()
