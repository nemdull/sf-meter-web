import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// 画面全体の色と書体。暗い宇宙の色に、計器の 3 色（まだ SF・研究中・ほぼ現実）を乗せる
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        space: { value: '#06112a' },
        deep: { value: '#030a1c' },
        hull: { value: '#0c1e44' },
        line: { value: '#27498a' },
        ice: { value: '#eef5ff' },
        haze: { value: '#a5bbdd' },
        sky: { value: '#66bff0' },
      },
      fonts: {
        heading: { value: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", Meiryo, system-ui, sans-serif' },
        body: { value: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", Meiryo, system-ui, sans-serif' },
        mono: { value: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
      },
    },
  },
  globalCss: {
    'html, body': {
      bg: 'space',
      color: 'ice',
      lineHeight: '1.8',
    },
    body: {
      minHeight: '100dvh',
      backgroundImage:
        'radial-gradient(90% 60% at 85% -10%, rgba(39, 73, 138, 0.75) 0%, transparent 62%), linear-gradient({colors.space}, {colors.deep})',
      backgroundAttachment: 'fixed',
    },
    '::selection': {
      bg: 'rgba(102, 191, 240, 0.4)',
    },
    ':focus-visible': {
      outline: '2px solid #ffc857',
      outlineOffset: '3px',
    },
  },
})

export const system = createSystem(defaultConfig, config)
