import { Box, Button, Flex, Text } from '@chakra-ui/react'

import type { Source } from '@/shared/api/techs'

type SourceBadgeProps = {
  source: Source | null
  onReconnect: () => void
}

/** いま出しているデータが、API のものか、同梱のサンプルかを知らせる */
export default function SourceBadge({ source, onReconnect }: SourceBadgeProps) {
  if (source === null) return null
  const live = source === 'api'

  return (
    <Flex align="center" gap="3" wrap="wrap" justify="flex-end">
      <Flex
        align="center"
        gap="2"
        px="3"
        py="1"
        borderWidth="1px"
        borderColor="rgba(39, 73, 138, 0.9)"
        borderRadius="full"
        bg="rgba(3, 10, 28, 0.7)"
        fontSize="sm"
        role="status"
      >
        <Box w="9px" h="9px" borderRadius="full" style={{ background: live ? '#62e6a0' : '#ffc857', boxShadow: `0 0 10px ${live ? '#62e6a0' : '#ffc857'}` }} aria-hidden="true" />
        <Text as="span">{live ? 'API につながっています' : 'サンプルデータを表示中'}</Text>
      </Flex>
      {live ? null : (
        <Button size="xs" variant="outline" borderColor="line" color="ice" _hover={{ bg: 'rgba(102, 191, 240, 0.16)' }} onClick={onReconnect}>
          API につなぎ直す
        </Button>
      )}
    </Flex>
  )
}
