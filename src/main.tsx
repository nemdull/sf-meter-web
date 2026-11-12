import { ChakraProvider } from '@chakra-ui/react'
import { MotionConfig } from 'framer-motion'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/app/App'
import { system } from '@/app/theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      {/* 端末の「動きを減らす」設定がオンなら、位置や大きさのアニメーションを止める */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ChakraProvider>
  </React.StrictMode>,
)
