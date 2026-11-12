import { Box, Flex, Heading, Text, chakra } from '@chakra-ui/react'

import { LEVEL_INFO, type Tech } from '@/shared/lib/tech'

type TechCardProps = {
  tech: Tech
  /** 上の大きな計器に出ているかどうか */
  selected: boolean
  onSelect: (tech: Tech) => void
}

/** テクノロジー 1 件ぶんのカード。押すと、上の計器がこの技術を指す */
export default function TechCard({ tech, selected, onSelect }: TechCardProps) {
  const info = LEVEL_INFO[tech.level]

  return (
    <chakra.button
      type="button"
      onClick={() => onSelect(tech)}
      aria-pressed={selected}
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      justifyContent="flex-start"
      w="full"
      h="full"
      p="5"
      textAlign="left"
      cursor="pointer"
      bg={selected ? 'rgba(102, 191, 240, 0.12)' : 'rgba(12, 30, 68, 0.72)'}
      borderWidth="1px"
      borderColor={selected ? 'sky' : 'rgba(39, 73, 138, 0.85)'}
      borderRadius="2xl"
      transition="border-color 0.2s, background 0.2s, transform 0.2s"
      _hover={{ borderColor: 'sky', transform: 'translateY(-3px)' }}
    >
      <Flex justify="space-between" align="baseline" gap="3">
        <Heading as="h3" fontSize="lg" lineHeight="1.5">
          {tech.name}
        </Heading>
        <Text flex="none" fontFamily="mono" fontSize="2xl" fontWeight="bold" lineHeight="1" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {tech.score}
        </Text>
      </Flex>

      {/* 実現度の帯。数字と同じ値を、長さでも見せる */}
      <Box mt="3" h="6px" borderRadius="full" bg="rgba(39, 73, 138, 0.6)" overflow="hidden" aria-hidden="true">
        <Box h="full" borderRadius="full" style={{ width: `${Math.max(tech.score, 2)}%`, background: info.color }} />
      </Box>

      <Text mt="3" color="haze" fontSize="sm" lineHeight="1.75">
        {tech.description}
      </Text>
      <Text mt="3" fontSize="xs" fontWeight="bold" style={{ color: info.color }}>
        {info.label}
      </Text>
    </chakra.button>
  )
}
