import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "一只杏仁九",
  description: "VitePress + Vue 搭建",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script',
      { src: './lib/L2Dwidget.min.js' }
    ],
    [
      'script',
      {},
      `setTimeout(() => {
        L2Dwidget.init({model: { jsonPath: "./assets/asuna_04.model.json" }});
      }, 200)`
    ],
    [
      'div',
      { hidden: '', style: "width:70%; height:46px; bottom:0; position:fixed;background-color: grey; line-height:46px; color:aliceblue; text-align: center;"}
    ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记', link: '/study/01-JavaSE/1JavaSE' }
    ],

    sidebar: [
      {
        text: '学习笔记',
        items: [
          {
            text: 'JavaSE',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'JavaSE', link: '/study/01-JavaSE/1JavaSE' },
              { text: 'java的异常机制', link: '/study/01-JavaSE/2java的异常机制' },
              { text: '常用api', link: '/study/01-JavaSE/3常用api' },
              { text: '泛型Generics和枚举Enum', link: '/study/01-JavaSE/4泛型Generics和枚举Enum' },
              { text: 'JAVA多线程入门', link: '/study/01-JavaSE/5JAVA多线程入门（重点）' },
              { text: '数据结构之——树', link: '/study/01-JavaSE/6数据结构之——树' },
              { text: '集合', link: '/study/01-JavaSE/7集合' },
              { text: 'IO流', link: '/study/01-JavaSE/8IO流' },
              { text: '注解和反射', link: '/study/01-JavaSE/9注解和反射' },
              { text: '网络编程', link: '/study/01-JavaSE/10网络编程' },
              { text: 'nio', link: '/study/01-JavaSE/11nio' },
              { text: '正则表达式', link: '/study/01-JavaSE/12正则表达式' },
              { text: 'linux', link: '/study/01-JavaSE/13linux' },
              { text: 'git', link: '/study/01-JavaSE/14git' },
            ]
          },
          {
            text: 'mysql',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'mysql', link: '/study/02-mysql/mysql' },
              { text: 'mysql进阶', link: '/study/02-mysql/mysql进阶' },
              { text: 'jdbc', link: '/study/02-mysql/jdbc' },
            ]
          },
          { text: 'javaweb', link: '/study/03-javaweb/javaweb' },
          {
            text: '框架',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'maven', link: '/study/04-框架/01-maven' },
              { text: '日志框架', link: '/study/04-框架/02-日志框架' },
              { text: '设计模式', link: '/study/04-框架/03-设计模式' },
              { text: 'mybatis', link: '/study/04-框架/04-mybatis' },
              { text: 'Spring', link: '/study/04-框架/05-Spring' },
              { text: 'Spring-mvc', link: '/study/04-框架/06-Spring-mvc' },
              { text: 'redis', link: '/study/04-框架/07-redis' },
              { text: 'redis进阶', link: '/study/04-框架/08-redis进阶' },
              { text: 'vue', link: '/study/04-框架/09-vue' },
              { text: 'nodejs', link: '/study/04-框架/10-nodejs' },
              { text: 'ssm小项目', link: '/study/04-框架/11-ssm小项目' },
              { text: 'mybatis-plus', link: '/study/04-框架/12-mybatis-plus' },
              { text: 'springboot', link: '/study/04-框架/13-springboot' },
            ]
          },
          {
            text: '中间件',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'SpringDataJPA', link: '/study/05-中间件/01-SpringDataJPA' },
              { text: 'SpringSecurity', link: '/study/05-中间件/02-SpringSecurity' },
            ]
          },

          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/niiKyu' }
    ]
  }
  
})
