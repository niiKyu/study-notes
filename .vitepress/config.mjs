import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "一只杏仁九",
  description: "VitePress + Vue 搭建",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],

  ],
  themeConfig: {
    footer: {
      message: '',
      copyright: 'Copyright © 2025-present Evan You'
    },
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
          {
            text: '其他',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: '面试题', link: '/study/其他/面试题' },
              { text: '阿里规约', link: '/study/其他/阿里规约' },
              { text: 'vitepress', link: '/study/其他/vitepress' },
            ]
          },

          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/niiKyu' }
    ],
    //本地搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    sidebarMenuLabel: '目录',
    returnToTopLabel:'返回顶部', 
    outline: { 
      level: [2,4], // 显示2-4级标题
      // level: 'deep', // 显示2-6级标题
      label: '当前页大纲' // 文字显示
    },
    //编辑本页 //
    editLink: { 
      pattern: 'https://github.com/niiKyu/study-notes', // 改成自己的仓库
      text: '在GitHub编辑本页'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short', // 可选值full、long、medium、short
        timeStyle: 'medium' // 可选值full、long、medium、short
      },
    },
    //自定义上下页名 //
    docFooter: { 
      prev: '上一页', 
      next: '下一页', 
    }, 
  },
  lastUpdated: true, //首次配置不会立即生效，需git提交后爬取时间戳 //
  markdown: {
    image: {
      // 开启图片懒加载
      lazyLoading: true
    },
  },
  
})
