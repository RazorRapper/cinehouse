import { useMemo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import Seat from './Seat.jsx'
import Screen from './Screen.jsx'
import { colors } from '../../tokens/colors.js'

// Lays out seats in concentric curved rows, all facing the screen at the
// front (negative z). Front rows sit closer to the screen; back rows rake
// upward (stadium seating) and get extra depth/spacing per tier — most
// pronounced for the Royal Recliner tier at the very back.
function layoutSeats(seatRows) {
  const blockGap = 0.5 // aisle gap between left/center/right blocks
  const rowRise = 0.2

  const laidOut = []
  const rowMeta = [] // { row, tierLabel, price, isFirstOfTier, labelPos, headerPos }
  let depthCursor = 0

  seatRows.forEach(({ row, rowIndex, seats, tier, tierLabel, price, isFirstOfTier }) => {
    const isRecliner = tier === 'recliner'
    const seatSpacing = isRecliner ? 0.95 : 0.72
    const rowDepth = isRecliner ? 1.05 : 0.85
    const radius = 10 + rowIndex * 0.25

    // Extra gap when a new tier begins (visually separates Club/Royal/Recliner).
    if (isFirstOfTier && rowIndex > 0) depthCursor += 0.7
    depthCursor += rowDepth

    const n = seats.length
    let cursor = 0
    const xOffsets = []
    for (let i = 0; i < n; i++) {
      if (i === 4 || i === 8) cursor += blockGap
      xOffsets.push(cursor)
      cursor += seatSpacing
    }
    const totalWidth = cursor - seatSpacing
    const centerOffset = totalWidth / 2

    seats.forEach((seat, i) => {
      const localX = xOffsets[i] - centerOffset
      const angle = localX / radius
      const x = radius * Math.sin(angle)
      const bow = radius * (1 - Math.cos(angle))
      const z = depthCursor + bow
      const y = rowIndex * rowRise
      laidOut.push({ ...seat, position: [x, y, z] })
    })

    rowMeta.push({
      row,
      tierLabel,
      price,
      isFirstOfTier,
      labelPos: [-centerOffset - 0.55, rowIndex * rowRise, depthCursor],
    })
  })

  return { seats: laidOut, rowMeta }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function RowLabel({ position, children }) {
  return (
    <Html position={position} center transform={false} zIndexRange={[5, 0]}>
      <span className="font-mono text-[11px] text-text-secondary select-none">{children}</span>
    </Html>
  )
}

// Tier/price key — plain DOM overlay rather than in-canvas Html labels.
// Reliable at any camera angle and easier to read than floating 3D text.
function TierPriceBar({ tiers }) {
  return (
    <div className="absolute top-16 inset-x-0 z-10 flex items-center justify-center gap-2 px-4 flex-wrap pointer-events-none">
      {tiers.map((t) => (
        <span
          key={t.tier}
          className="font-mono text-[11px] tracking-wide text-text-secondary uppercase whitespace-nowrap
            bg-bg-base/70 backdrop-blur rounded-full px-2.5 py-1 border border-border-subtle"
        >
          ₹{t.price} · {t.tierLabel}
        </span>
      ))}
    </div>
  )
}

export function SeatMap({ seatRows, selectedIds, onToggleSeat }) {
  const reducedMotion = usePrefersReducedMotion()
  const { seats, rowMeta } = useMemo(() => layoutSeats(seatRows), [seatRows])
  const tiers = useMemo(() => {
    const seen = new Map()
    rowMeta.forEach((m) => {
      if (!seen.has(m.tierLabel)) seen.set(m.tierLabel, { tier: m.tierLabel, tierLabel: m.tierLabel, price: m.price })
    })
    return [...seen.values()]
  }, [rowMeta])

  return (
    <div className="relative w-full h-[58vh] min-h-[420px] bg-bg-base">
      <TierPriceBar tiers={tiers} />
      <Canvas camera={{ position: [0, 7.5, 12], fov: 48 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <color attach="background" args={[colors.bgBase]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[0, 8, 4]} intensity={0.35} />

        <Screen />

        <group position={[0, 0, -1.5]}>
          {seats.map((seat) => (
            <Seat
              key={seat.id}
              seat={seat}
              isSelected={selectedIds.includes(seat.id)}
              onToggle={onToggleSeat}
              reducedMotion={reducedMotion}
            />
          ))}

          {rowMeta.map((meta) => (
            <RowLabel key={meta.row} position={meta.labelPos}>
              {meta.row}
            </RowLabel>
          ))}
        </group>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.12}
          minDistance={7}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.4}
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
          target={[0, 1.6, 3]}
        />
      </Canvas>
    </div>
  )
}

export default SeatMap
