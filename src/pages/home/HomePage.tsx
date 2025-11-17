import { Box, Center, Container, Flex, Heading, SimpleGrid, Spinner, Text } from '@chakra-ui/react'
import TechCard, { type Tech } from '@/shared/ui/molecules/tech-card'
import { useEffect, useState } from 'react'
import { getTechs } from '@/api'

const siteTitle = 'SF Meter'

export default function HomePage() {
  const [techs, setTechs] = useState<Tech[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    getTechs()
      .then(data => {
        setTechs(data)
        setHasError(false)
      })
      .catch(error => {
        console.error(error)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Flex direction="column" minH="100dvh" bg="gray.950">
      <Box as="header" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.300">
        <Heading size="lg" color="whiteAlpha.900">{siteTitle}</Heading>
      </Box>
      <Container as="main" flex="1" maxW="5xl" px={6} py={10}>
        {hasError ? (
          <Center border="1px solid" borderColor="red.400" borderRadius="lg" py={8}>
            <Text color="red.200">技術カードの取得に失敗しました。</Text>
          </Center>
        ) : isLoading ? (
          <Center py={12}>
            <Spinner color="whiteAlpha.800" size="xl" />
          </Center>
        ) : techs.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} justifyItems="center">
            {techs.map(tech => (
              <TechCard key={tech.id} tech={tech} />
            ))}
          </SimpleGrid>
        ) : (
          <Center border="1px dashed" borderColor="whiteAlpha.400" borderRadius="lg" py={8}>
            <Text color="gray.300">まだカードが登録されていません。</Text>
          </Center>
        )}
      </Container>
    </Flex>
  )
}
