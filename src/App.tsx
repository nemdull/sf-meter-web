import { Box, Center, Flex, Heading } from '@chakra-ui/react'
import TechCard from './components/TechCard'

export default function App() {
  const tech = {
    id: 1,
    name: 'ドミネーター',
    description: '犯罪係数で裁く未来銃',
    score: 35,
  }
  const siteTitle = 'SF Meter'

  return (
    <Flex direction="column" minH="100dvh" bg="gray.950">
      <Box as="header" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.300">
        <Heading size="lg" color="whiteAlpha.900">{siteTitle}</Heading>
      </Box>
      <Center flex="1" px={6} py={8}>
        <TechCard tech={tech} />
      </Center>
    </Flex>
  )
}
