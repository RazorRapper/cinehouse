import { Html } from '@react-three/drei'
import { colors } from '../../tokens/colors.js'

// Curved cinema screen — a bent plane glowing accent-marquee-dim, with a
// point light that falls off toward the back rows (front rows read subtly
// brighter, per spec).

export function Screen({ width = 12, curveDepth = 1.1 }) {
  const segments = 32
  const points = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (t - 0.5) * width
    // shallow arc bowing away from the audience (toward +z / back of scene)
    const z = Math.sin(t * Math.PI) * curveDepth
    points.push([x, 0, z])
  }

  return (
    <group position={[0, 4.4, -6]}>
      {/* Screen strip built from thin boxes following the curve */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1]
        const midX = (p[0] + next[0]) / 2
        const midZ = (p[2] + next[2]) / 2
        const dx = next[0] - p[0]
        const dz = next[2] - p[2]
        const segLen = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dx, dz)
        return (
          <mesh key={i} position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
            <boxGeometry args={[segLen * 1.02, 1.6, 0.06]} />
            <meshStandardMaterial
              color={colors.accentMarqueeDim}
              emissive={colors.accentMarqueeDim}
              emissiveIntensity={1.1}
              toneMapped={false}
            />
          </mesh>
        )
      })}

      {/* Soft light falling toward the audience, brighter on front rows */}
      <pointLight
        position={[0, -1, 3]}
        intensity={18}
        distance={16}
        decay={2}
        color={colors.accentMarquee}
      />

      {/* Small mono "SCREEN" label, centered under the curve */}
      <Html position={[0, -1.15, curveDepth * 0.6]} center transform={false} zIndexRange={[10, 0]}>
        <span className="font-mono text-[11px] tracking-[0.3em] text-text-secondary uppercase select-none whitespace-nowrap">
          Screen
        </span>
      </Html>
    </group>
  )
}

export default Screen
