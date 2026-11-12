import { Box, Text } from '@chakra-ui/react'
import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { LEVELS, LEVEL_INFO, levelOf } from '@/shared/lib/tech'

// 文字盤の形。中心 (160, 160)・半径 120 で、左下（150°）から右下（390°）まで 240° ぶん振れる
const CENTER = 160
const RADIUS = 120
const START = 150
const SWEEP = 240

const point = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180
  return `${(CENTER + radius * Math.cos(rad)).toFixed(2)} ${(CENTER + radius * Math.sin(rad)).toFixed(2)}`
}

/** 実現度 from〜to の区間を、半径 radius の弧にする */
const arc = (from: number, to: number, radius: number) => {
  const a = START + (from / 100) * SWEEP
  const b = START + (to / 100) * SWEEP
  return `M ${point(a, radius)} A ${radius} ${radius} 0 ${b - a > 180 ? 1 : 0} 1 ${point(b, radius)}`
}

/** 数字を、いまの値から目標までなめらかに動かす */
function useCount(target: number, still: boolean) {
  const [shown, setShown] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    if (still) {
      current.current = target
      setShown(target)
      return
    }
    const controls = animate(current.current, target, {
      duration: 0.9,
      ease: [0.2, 0.9, 0.2, 1],
      onUpdate: (value) => {
        current.current = value
        setShown(Math.round(value))
      },
    })
    return () => controls.stop()
  }, [target, still])

  return shown
}

type MeterProps = {
  /** 実現度。0〜100 */
  score: number
  /** 読み上げ用の説明に使う、テクノロジーの名前 */
  name: string
}

/** 実現度を針で示す計器 */
export default function Meter({ score, name }: MeterProps) {
  const still = useReducedMotion() ?? false
  const shown = useCount(score, still)
  const level = levelOf(score)
  const info = LEVEL_INFO[level]

  return (
    <Box position="relative" w="full" maxW="420px" mx="auto">
      <svg viewBox="0 0 320 262" role="img" aria-label={`${name}の実現度は ${score}。${info.label}`} style={{ display: 'block', width: '100%' }}>
        {/* 外側の細い帯: 3 つの段階の区切り */}
        {LEVELS.map((key) => (
          <path
            key={key}
            d={arc(LEVEL_INFO[key].min + 0.6, LEVEL_INFO[key].max + 0.4, RADIUS + 16)}
            fill="none"
            stroke={LEVEL_INFO[key].color}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={key === level ? 1 : 0.35}
            style={{ transition: 'opacity 0.4s' }}
          />
        ))}

        {/* 目盛り。10 ごとに長い線 */}
        {Array.from({ length: 21 }, (_, index) => {
          const angle = START + (index * 5 * SWEEP) / 100
          const major = index % 2 === 0
          return (
            <line
              key={index}
              x1={CENTER + RADIUS - 22}
              y1={CENTER}
              x2={CENTER + RADIUS - (major ? 34 : 28)}
              y2={CENTER}
              stroke="#a5bbdd"
              strokeWidth={major ? 2 : 1}
              opacity={major ? 0.8 : 0.45}
              transform={`rotate(${angle} ${CENTER} ${CENTER})`}
            />
          )
        })}
        {[0, 50, 100].map((value) => {
          const [x, y] = point(START + (value / 100) * SWEEP, RADIUS - 50).split(' ')
          return (
            <text key={value} x={x} y={y} fill="#a5bbdd" fontSize="13" textAnchor="middle" dominantBaseline="middle" fontFamily="ui-monospace, Menlo, monospace">
              {value}
            </text>
          )
        })}

        {/* 太い帯: 下地と、実現度のぶんだけ色が付く帯 */}
        <path d={arc(0, 100, RADIUS)} fill="none" stroke="#27498a" strokeOpacity="0.6" strokeWidth="16" strokeLinecap="round" />
        <path
          d={arc(0, 100, RADIUS)}
          fill="none"
          stroke={info.color}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${score} 100`}
          style={{
            transition: still ? 'none' : 'stroke-dasharray 0.9s cubic-bezier(0.2, 0.9, 0.2, 1), stroke 0.4s',
            filter: `drop-shadow(0 0 10px ${info.color}88)`,
          }}
        />

        {/* 針。少し行きすぎてから戻る */}
        <g
          style={{
            transformBox: 'view-box',
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transform: `rotate(${START + (score / 100) * SWEEP}deg)`,
            transition: still ? 'none' : 'transform 0.9s cubic-bezier(0.3, 1.45, 0.5, 1)',
          }}
        >
          <line x1={CENTER - 18} y1={CENTER} x2={CENTER + RADIUS - 30} y2={CENTER} stroke="#eef5ff" strokeWidth="4" strokeLinecap="round" />
          <circle cx={CENTER} cy={CENTER} r="9" fill="#eef5ff" />
          <circle cx={CENTER} cy={CENTER} r="3.5" fill="#06112a" />
        </g>
      </svg>

      <Box position="absolute" insetX="0" bottom="0" textAlign="center" aria-hidden="true">
        <Text as="span" fontFamily="mono" fontSize={{ base: '5xl', md: '6xl' }} fontWeight="bold" lineHeight="1" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {shown}
        </Text>
        <Text as="span" ml="2" color="haze" fontSize="sm">
          / 100
        </Text>
        <Text mt="1" fontSize="sm" fontWeight="bold" style={{ color: info.color, transition: 'color 0.4s' }}>
          {info.label}
        </Text>
      </Box>
    </Box>
  )
}
