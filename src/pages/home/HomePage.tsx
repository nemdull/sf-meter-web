import { Box, Center, Flex, Heading } from '@chakra-ui/react'
import TechCard, { type Tech } from '@/shared/ui/molecules/tech-card'
import { useEffect, useState } from 'react'
import { getTechs } from '@/api'

const siteTitle = 'SF Meter'

export default function HomePage() {
  const [techs, setTechs] = useState<Tech[]>([])
  useEffect(() => {
    getTechs().then(setTechs).catch(console.error)
  }, [])

  return (
    <Flex direction="column" minH="100dvh" bg="gray.950">
      <Box as="header" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.300">
        <Heading size="lg" color="whiteAlpha.900">{siteTitle}</Heading>
      </Box>
      <Center flex="1" px={6} py={8}>
        {techs && techs.map(tech => <TechCard key={tech.id} tech={tech} />)}
      </Center>
    </Flex>
  )
}
