import { Box, Flex, Text } from '@chakra-ui/react'

import { LEVELS, LEVEL_INFO, type Stats } from '@/shared/lib/tech'

/** 全体のうち、3 つの段階がそれぞれ何件あるかを 1 本の帯で見せる */
export default function LevelBar({ stats }: { stats: Stats }) {
  return (
    <Box>
      <Flex h="10px" gap="3px" borderRadius="full" overflow="hidden" aria-hidden="true">
        {LEVELS.map((level) =>
          stats.levels[level] > 0 ? (
            <Box key={level} style={{ flexGrow: stats.levels[level], background: LEVEL_INFO[level].color }} />
          ) : null,
        )}
      </Flex>
      <Flex as="ul" mt="3" gap="5" wrap="wrap" listStyleType="none">
        {LEVELS.map((level) => (
          <Flex as="li" key={level} align="center" gap="2" fontSize="sm">
            <Box w="10px" h="10px" borderRadius="full" style={{ background: LEVEL_INFO[level].color }} aria-hidden="true" />
            <Text as="span" color="haze">
              {LEVEL_INFO[level].label}
            </Text>
            <Text as="span" fontFamily="mono" fontWeight="bold">
              {stats.levels[level]}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
