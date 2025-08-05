import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My Blog',
  description: 'A VitePress site',
  base: '/blog-new/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Spring Boot', link: '/springboot/' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/springboot/': [
        {
          text: 'Spring Boot 教程',
          items: [
            { text: '快速入门', link: '/springboot/quick-start' },
            { text: '配置文件详解', link: '/springboot/configuration' },
            { text: '数据访问与JPA', link: '/springboot/data-access' }
          ]
        }
      ],
      '/': [
        {
          text: '指南',
          items: [
            { text: '开始使用', link: '/guide/getting-started' }
          ]
        }
      ]
    }
  }
})