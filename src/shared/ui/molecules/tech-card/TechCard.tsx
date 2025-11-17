import { Box, Heading, Text, Stack, Progress } from '@chakra-ui/react'

export type Tech = {
  id: number
  name: string
  description: string
  score: number
}

const getScoreColor = (score: number) => {
  if (score >= 70) return 'green.300'
  if (score >= 40) return 'yellow.300'
  return 'red.300'
}

export default function TechCard({ tech }: { tech: Tech }) {
  const progressColor = getScoreColor(tech.score)
  return (
    <Box bg="gray.900" color="gray.100" borderRadius="xl" boxShadow="xl" p={6} w="full" maxW="360px">
      <Stack gap="3">
        <Heading size="md">{tech.name}</Heading>
        <Text fontSize="sm" color="gray.300">
          {tech.description}
        </Text>
        <Stack gap="1">
          <Text fontSize="sm" color="gray.400">
            実現度
          </Text>
          <Progress.Root value={tech.score} max={100}>
            <Progress.Track borderRadius="full" bg="whiteAlpha.200">
              <Progress.Range borderRadius="full" bg={progressColor} />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color="gray.300">
            {tech.score}
          </Text>
        </Stack>
      </Stack>
    </Box>
  )
}
