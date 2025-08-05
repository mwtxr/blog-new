import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My Blog',
  description: 'A VitePress site',
  base: '/blog-new/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      }
    ]
  }
})