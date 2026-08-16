// CineHouse design tokens — typography
// Font stacks mirrored in src/index.css (@theme + @font-face imports).

export const fonts = {
  display: "'Bebas Neue', 'Archivo Expanded', sans-serif",
  body: "'Inter', 'General Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}

// Mobile base sizes (px). Scale up via Tailwind responsive variants.
export const fontSizes = {
  displaySm: '28px',
  displayMd: '32px',
  displayLg: '40px',
  bodySm: '14px',
  bodyMd: '16px',
  monoSm: '13px',
  monoMd: '15px',
}

export default fonts
