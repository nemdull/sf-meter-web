import { Box, Button, Container, Flex, Grid, Heading, Input, Link, NativeSelect, SegmentGroup, Skeleton, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { drawRandom } from '@/shared/api/techs'
import {
  DEFAULT_QUERY,
  LEVELS,
  LEVEL_INFO,
  SORT_LABELS,
  queryFromSearch,
  searchFromQuery,
  type SortKey,
  type Tech,
  type TechQuery,
} from '@/shared/lib/tech'
import LevelBar from '@/shared/ui/molecules/level-bar'
import Meter from '@/shared/ui/molecules/meter'
import SourceBadge from '@/shared/ui/molecules/source-badge'
import TechCard from '@/shared/ui/molecules/tech-card'

import { useBoard } from './useBoard'

const LEVEL_ITEMS = [
  { value: 'all', label: 'すべて' },
  ...LEVELS.map((level) => ({ value: level, label: LEVEL_INFO[level].short })),
]

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[]

const panel = {
  bg: 'rgba(12, 30, 68, 0.72)',
  borderWidth: '1px',
  borderColor: 'rgba(39, 73, 138, 0.85)',
  borderRadius: '2xl',
} as const

export default function HomePage() {
  // 条件は URL にも書く。絞り込んだ状態のまま、人に URL を渡せるように
  const [query, setQuery] = useState<TechQuery>(() => queryFromSearch(window.location.search))
  const { board, loading, failed, reconnect } = useBoard(query)
  const [picked, setPicked] = useState<Tech | null>(null)
  const [drawing, setDrawing] = useState(false)
  const meterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${searchFromQuery(query)}`)
  }, [query])

  // 最初の 1 件は、読み込めた一覧の先頭を計器に出す
  useEffect(() => {
    if (picked === null && board && board.techs.length > 0) setPicked(board.techs[0])
  }, [board, picked])

  const change = (patch: Partial<TechQuery>) => setQuery((current) => ({ ...current, ...patch }))

  const select = (tech: Tech) => {
    setPicked(tech)
    // 計器が画面の外にあるときだけ、見える所まで戻す
    const box = meterRef.current?.getBoundingClientRect()
    if (box && (box.top < 0 || box.bottom > window.innerHeight)) {
      meterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const draw = async () => {
    if (!board) return
    setDrawing(true)
    try {
      // 同じものが続けて出たら、もう 1 回だけ引き直す
      let next = await drawRandom(board.source, new AbortController().signal)
      if (next.id === picked?.id) next = await drawRandom(board.source, new AbortController().signal)
      setPicked(next)
    } finally {
      setDrawing(false)
    }
  }

  const techs = board?.techs ?? []
  const filtered = query.q.trim() !== '' || query.level !== 'all'

  return (
    <Container maxW="6xl" px={{ base: '5', md: '8' }} pb="16">
      <Flex as="header" py="5" align="center" justify="space-between" gap="4" wrap="wrap">
        <Flex align="center" gap="3">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5.6 22 A12 12 0 1 1 26.4 22" fill="none" stroke="#66bff0" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="16" y1="16" x2="22.5" y2="9.5" stroke="#eef5ff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="16" cy="16" r="2.6" fill="#eef5ff" />
          </svg>
          <Text fontSize="xl" fontWeight="bold" letterSpacing="0.02em">
            SF Meter
          </Text>
        </Flex>
        <SourceBadge source={board?.source ?? null} onReconnect={reconnect} />
      </Flex>

      <Box as="main">
        <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' }} gap={{ base: '8', lg: '12' }} alignItems="center" py={{ base: '6', lg: '12' }}>
          <Box>
            <Heading as="h1" fontSize={{ base: '3xl', md: '4xl', xl: '5xl' }} lineHeight="1.3" letterSpacing="-0.01em" whiteSpace="nowrap">
              SF の技術は、
              <br />
              いまどれくらい現実か。
            </Heading>
            <Text mt="4" color="haze" maxW="30rem">
              SF 作品に出てくるテクノロジーに、0 から 100 の「実現度」をつけて並べました。数字は目安です。
            </Text>

            <Box mt="8" minH="8.5rem" aria-live="polite">
              {picked ? (
                <>
                  <Text color="sky" fontSize="sm" fontWeight="bold">
                    いま計器が指しているもの
                  </Text>
                  <Heading as="h2" mt="1" fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1.4">
                    {picked.name}
                  </Heading>
                  <Text mt="2" color="haze">
                    {picked.description}
                  </Text>
                </>
              ) : (
                <Skeleton h="6rem" borderRadius="xl" />
              )}
            </Box>

            <Button mt="6" size="lg" borderRadius="full" bg="sky" color="#04122b" fontWeight="bold" _hover={{ bg: '#9ad6f8' }} onClick={draw} loading={drawing} disabled={!board}>
              ほかの技術を引く
            </Button>
          </Box>

          <Box ref={meterRef}>
            <Meter score={picked?.score ?? 0} name={picked?.name ?? '読み込み中'} />
          </Box>
        </Grid>

        {board ? (
          <Grid templateColumns={{ base: '1fr 1fr', md: 'auto auto minmax(0, 1fr)' }} gap={{ base: '5', md: '10' }} alignItems="center" p={{ base: '5', md: '6' }} {...panel}>
            <Box>
              <Text color="haze" fontSize="sm">
                登録されている技術
              </Text>
              <Text fontFamily="mono" fontSize="3xl" fontWeight="bold" lineHeight="1.2">
                {board.stats.count}
                <Text as="span" ml="1" fontSize="sm" fontWeight="normal" color="haze">
                  件
                </Text>
              </Text>
            </Box>
            <Box>
              <Text color="haze" fontSize="sm">
                実現度の平均
              </Text>
              <Text fontFamily="mono" fontSize="3xl" fontWeight="bold" lineHeight="1.2">
                {board.stats.average.toFixed(1)}
              </Text>
            </Box>
            <Box gridColumn={{ base: '1 / -1', md: 'auto' }}>
              <LevelBar stats={board.stats} />
            </Box>
          </Grid>
        ) : null}

        <Flex mt="10" gap="4" direction={{ base: 'column', lg: 'row' }} align={{ lg: 'center' }}>
          <Input
            type="search"
            aria-label="名前や説明で探す"
            placeholder="名前や説明で探す"
            value={query.q}
            maxLength={100}
            onChange={(event) => change({ q: event.target.value })}
            flex={{ lg: '1' }}
            size="lg"
            bg="rgba(3, 10, 28, 0.7)"
            borderColor="line"
            borderRadius="full"
            px="5"
            _placeholder={{ color: 'haze' }}
          />
          <SegmentGroup.Root
            value={query.level}
            onValueChange={(event) => change({ level: (event.value ?? 'all') as TechQuery['level'] })}
            size="md"
            bg="rgba(3, 10, 28, 0.7)"
            aria-label="段階で絞り込む"
            alignSelf={{ base: 'flex-start', lg: 'center' }}
            maxW="full"
          >
            <SegmentGroup.Indicator bg="rgba(102, 191, 240, 0.28)" />
            <SegmentGroup.Items items={LEVEL_ITEMS} color="ice" />
          </SegmentGroup.Root>
          <NativeSelect.Root size="lg" w={{ base: 'full', lg: '13rem' }}>
            <NativeSelect.Field
              aria-label="並び順"
              value={query.sort}
              onChange={(event) => change({ sort: event.currentTarget.value as SortKey })}
              bg="rgba(3, 10, 28, 0.7)"
              borderColor="line"
              borderRadius="full"
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>

        <Flex mt="5" mb="4" align="center" justify="space-between" gap="4" minH="2rem">
          <Text color="haze" fontSize="sm" role="status">
            {board ? (filtered ? `${board.stats.count} 件のうち ${techs.length} 件` : `${techs.length} 件`) : '読み込んでいます'}
          </Text>
          {filtered ? (
            <Button size="xs" variant="ghost" color="sky" _hover={{ bg: 'rgba(102, 191, 240, 0.16)' }} onClick={() => setQuery({ ...DEFAULT_QUERY, sort: query.sort })}>
              絞り込みをやめる
            </Button>
          ) : null}
        </Flex>

        {failed ? (
          <Box p="8" textAlign="center" {...panel}>
            <Text>読み込めませんでした。</Text>
            <Button mt="4" size="sm" variant="outline" borderColor="line" color="ice" onClick={reconnect}>
              もう一度読み込む
            </Button>
          </Box>
        ) : board === null ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }} gap="4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} h="11rem" borderRadius="2xl" />
            ))}
          </Grid>
        ) : techs.length === 0 ? (
          <Box p="8" textAlign="center" {...panel}>
            <Text>条件に合う技術が見つかりませんでした。</Text>
            <Text mt="1" color="haze" fontSize="sm">
              まだ誰も思いついていないのかもしれません。
            </Text>
          </Box>
        ) : (
          <Grid
            as="ul"
            templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }}
            gap="4"
            listStyleType="none"
            opacity={loading ? 0.6 : 1}
            transition="opacity 0.2s"
          >
            {/* 並び順や絞り込みを変えると、カードが自分の新しい場所まで動く */}
            <AnimatePresence mode="popLayout" initial={false}>
              {techs.map((tech) => (
                <motion.li
                  key={tech.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <TechCard tech={tech} selected={tech.id === picked?.id} onSelect={select} />
                </motion.li>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Box>

      <Flex as="footer" mt="16" pt="6" borderTopWidth="1px" borderColor="rgba(39, 73, 138, 0.7)" gap="5" wrap="wrap" color="haze" fontSize="sm">
        <Link href="https://github.com/nemdull/sf-meter-api" color="sky" target="_blank" rel="noreferrer">
          API のコード（Go）
        </Link>
        <Link href="https://github.com/nemdull/sf-meter-web" color="sky" target="_blank" rel="noreferrer">
          画面のコード（React）
        </Link>
        <Link href="https://www.nemdull.com/" color="sky" target="_blank" rel="noreferrer">
          作った人
        </Link>
      </Flex>
    </Container>
  )
}
