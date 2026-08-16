import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { colors } from '../../tokens/colors.js'

const COLOR_BY_STATE = {
  available: colors.seatAvailable,
  selected: colors.seatSelected,
  booked: colors.seatBooked,
}

const FRAME_COLOR = '#20242F' // neutral chair frame — never the state color
const RECLINER_TRIM = colors.accentMarqueeDim // subtle premium cue, not a state signal

// Motion rule #1: hover scale to ~1.15x over 150ms ease-out.
// Motion rule #2: seat color state crossfade over 200ms.
// Both implemented as per-frame lerps (three.js has no CSS transitions).
const HOVER_LERP_MS = 150
const COLOR_LERP_MS = 200

export function Seat({ seat, isSelected, onToggle, reducedMotion = false }) {
  const groupRef = useRef()
  const cushionMatRef = useRef()
  const backMatRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)

  const state = seat.status === 'booked' ? 'booked' : isSelected ? 'selected' : 'available'
  const interactive = seat.status !== 'booked'
  const isRecliner = seat.tier === 'recliner'

  const targetColor = useMemo(() => new THREE.Color(COLOR_BY_STATE[state]), [state])
  const currentColor = useRef(new THREE.Color(COLOR_BY_STATE[state]))
  const currentScale = useRef(1)

  // Chair proportions — recliners are wider and taller, with a headrest bump.
  const seatW = isRecliner ? 0.72 : 0.56
  const seatD = isRecliner ? 0.56 : 0.48
  const backH = isRecliner ? 0.6 : 0.5
  const armH = isRecliner ? 0.3 : 0.24

  useFrame((_, delta) => {
    if (!groupRef.current || !cushionMatRef.current || !backMatRef.current) return

    // Scale toward target (hover grow), skip animation if reduced motion.
    const targetScale = hovered && interactive ? 1.15 : 1
    if (reducedMotion) {
      currentScale.current = targetScale
    } else {
      const scaleAlpha = 1 - Math.exp((-delta * 1000) / HOVER_LERP_MS)
      currentScale.current += (targetScale - currentScale.current) * scaleAlpha
    }
    groupRef.current.scale.setScalar(currentScale.current)

    // Color crossfade toward target state color (fabric parts only).
    if (reducedMotion) {
      currentColor.current.copy(targetColor)
    } else {
      const colorAlpha = 1 - Math.exp((-delta * 1000) / COLOR_LERP_MS)
      currentColor.current.lerp(targetColor, colorAlpha)
    }
    cushionMatRef.current.color.copy(currentColor.current)
    cushionMatRef.current.emissive.copy(currentColor.current)
    backMatRef.current.color.copy(currentColor.current)
    backMatRef.current.emissive.copy(currentColor.current)

    // Glow ring opacity: visible on hover for available/selected seats only.
    if (glowRef.current) {
      const targetOpacity = hovered && interactive ? 0.35 : 0
      const alpha = reducedMotion ? 1 : 1 - Math.exp((-delta * 1000) / HOVER_LERP_MS)
      glowRef.current.material.opacity += (targetOpacity - glowRef.current.material.opacity) * alpha
      glowRef.current.material.color.copy(currentColor.current)
    }
  })

  return (
    <group
      position={seat.position}
      onPointerOver={(e) => {
        if (!interactive) return
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        if (!interactive) return
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        if (!interactive) return
        e.stopPropagation()
        onToggle(seat)
      }}
    >
      {/* Glow ring — faint, in the seat's own color, never amber */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, seatD / 2 + 0.05]}>
        <ringGeometry args={[seatW / 2 + 0.08, seatW / 2 + 0.2, 24]} />
        <meshBasicMaterial color={COLOR_BY_STATE[state]} transparent opacity={0} toneMapped={false} />
      </mesh>

      <group ref={groupRef}>
        {/* Legs / base frame */}
        <mesh position={[-seatW / 2 + 0.05, -0.28, -seatD / 2 + 0.05]}>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} roughness={0.7} />
        </mesh>
        <mesh position={[seatW / 2 - 0.05, -0.28, -seatD / 2 + 0.05]}>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} roughness={0.7} />
        </mesh>
        <mesh position={[-seatW / 2 + 0.05, -0.28, seatD / 2 - 0.05]}>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} roughness={0.7} />
        </mesh>
        <mesh position={[seatW / 2 - 0.05, -0.28, seatD / 2 - 0.05]}>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} roughness={0.7} />
        </mesh>

        {/* Seat cushion */}
        <RoundedBox args={[seatW, 0.12, seatD]} radius={0.05} smoothness={3} position={[0, -0.08, 0]}>
          <meshStandardMaterial
            ref={cushionMatRef}
            color={COLOR_BY_STATE[state]}
            emissive={COLOR_BY_STATE[state]}
            emissiveIntensity={0.28}
            roughness={0.6}
            metalness={0.04}
          />
        </RoundedBox>

        {/* Backrest — tilted slightly back for a reclined silhouette */}
        <group position={[0, 0.24, -seatD / 2 + 0.05]} rotation={[isRecliner ? -0.22 : -0.12, 0, 0]}>
          <RoundedBox args={[seatW, backH, 0.1]} radius={0.05} smoothness={3}>
            <meshStandardMaterial
              ref={backMatRef}
              color={COLOR_BY_STATE[state]}
              emissive={COLOR_BY_STATE[state]}
              emissiveIntensity={0.28}
              roughness={0.6}
              metalness={0.04}
            />
          </RoundedBox>
          {/* Headrest bump — recliners only */}
          {isRecliner && (
            <mesh position={[0, backH / 2 + 0.08, 0]}>
              <boxGeometry args={[seatW * 0.7, 0.14, 0.11]} />
              <meshStandardMaterial color={FRAME_COLOR} roughness={0.6} />
            </mesh>
          )}
        </group>

        {/* Armrests */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * (seatW / 2 + 0.04), -0.02, 0]}>
            <RoundedBox args={[0.08, armH, seatD * 0.85]} radius={0.03} smoothness={2}>
              <meshStandardMaterial color={FRAME_COLOR} roughness={0.55} metalness={0.15} />
            </RoundedBox>
            {isRecliner && (
              <mesh position={[0, armH / 2 + 0.005, 0]}>
                <boxGeometry args={[0.09, 0.01, seatD * 0.85]} />
                <meshStandardMaterial
                  color={RECLINER_TRIM}
                  emissive={RECLINER_TRIM}
                  emissiveIntensity={0.4}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

export default Seat
