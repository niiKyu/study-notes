import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "一只杏仁九",
  description: "VitePress + Vue 搭建",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],

  ],
  themeConfig: {

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记', link: '/markdown/01-JavaSE/1JavaSE' },
      {
        text: '工具',
        items: [
          { text: 'docx工具', link: '/nav/word-tools.md' },
          // { text: '2', link: '/nav/wechat.md' },
          // { text: '3', link: '/nav/wechat.md' }
        ]
      },
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
              { text: 'JavaSE', link: '/markdown/01-JavaSE/1JavaSE' },
              { text: 'java的异常机制', link: '/markdown/01-JavaSE/2java的异常机制' },
              { text: '常用api', link: '/markdown/01-JavaSE/3常用api' },
              { text: '泛型Generics和枚举Enum', link: '/markdown/01-JavaSE/4泛型Generics和枚举Enum' },
              { text: 'JAVA多线程入门', link: '/markdown/01-JavaSE/5JAVA多线程入门（重点）' },
              { text: '数据结构之——树', link: '/markdown/01-JavaSE/6数据结构之——树' },
              { text: '集合', link: '/markdown/01-JavaSE/7集合' },
              { text: 'IO流', link: '/markdown/01-JavaSE/8IO流' },
              { text: '注解和反射', link: '/markdown/01-JavaSE/9注解和反射' },
              { text: '网络编程', link: '/markdown/01-JavaSE/10网络编程' },
              { text: 'nio', link: '/markdown/01-JavaSE/11nio' },
              { text: '正则表达式', link: '/markdown/01-JavaSE/12正则表达式' },
              { text: 'linux', link: '/markdown/01-JavaSE/13linux' },
              { text: 'git', link: '/markdown/01-JavaSE/14git' },
            ]
          },
          {
            text: 'mysql',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'mysql', link: '/markdown/02-mysql/mysql' },
              { text: 'mysql进阶', link: '/markdown/02-mysql/mysql进阶' },
              { text: 'jdbc', link: '/markdown/02-mysql/jdbc' },
            ]
          },
          { text: 'javaweb', link: '/markdown/03-javaweb/javaweb' },
          {
            text: '框架',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'maven', link: '/markdown/04-框架/01-maven' },
              { text: '日志框架', link: '/markdown/04-框架/02-日志框架' },
              { text: '设计模式', link: '/markdown/04-框架/03-设计模式' },
              { text: 'mybatis', link: '/markdown/04-框架/04-mybatis' },
              { text: 'Spring', link: '/markdown/04-框架/05-Spring' },
              { text: 'Spring-mvc', link: '/markdown/04-框架/06-Spring-mvc' },
              { text: 'redis', link: '/markdown/04-框架/07-redis' },
              { text: 'redis进阶', link: '/markdown/04-框架/08-redis进阶' },
              { text: 'vue', link: '/markdown/04-框架/09-vue' },
              { text: 'nodejs', link: '/markdown/04-框架/10-nodejs' },
              { text: 'ssm小项目', link: '/markdown/04-框架/11-ssm小项目' },
              { text: 'mybatis-plus', link: '/markdown/04-框架/12-mybatis-plus' },
              { text: 'springboot', link: '/markdown/04-框架/13-springboot' },
              { text: 'SpringDataJPA', link: '/markdown/04-框架/14-SpringDataJPA' },
              { text: 'SpringSecurity', link: '/markdown/04-框架/15-SpringSecurity' },
            ]
          },
          {
            text: '中间件和微服务',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: 'RocketMQ', link: '/markdown/05-中间件/01-RocketMQ' },
              { text: 'Activiti', link: '/markdown/05-中间件/02-Activiti' },
              { text: 'SpringCloud', link: '/markdown/05-中间件/03-SpringCloud' },
              { text: 'SpringCloudAlibaba', link: '/markdown/05-中间件/04-SpringCloudAlibaba' },
            ]
          },
          {
            text: '其他',
            // 开启折叠按钮
            collapsible: true,
            collapsed: true,
            items: [
              { text: '面试题', link: '/markdown/其他/面试题' },
              { text: '阿里规约', link: '/markdown/其他/阿里规约' },
              { text: 'vitepress', link: '/markdown/其他/vitepress' },
              { text: '开发手册1', link: '/markdown/其他/单体应用开发手册' },
              { text: '开发手册2', link: '/markdown/其他/微服务开发手册' },
            ]
          },

          // { text: 'Markdown Examples', link: '/markdown-examples' },
          // { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/niiKyu' },
      {
        icon: {
          svg: '<svg t="1703483542872" class="icon" viewBox="0 0 1309 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6274" width="200" height="200"><path d="M1147.26896 912.681417l34.90165 111.318583-127.165111-66.823891a604.787313 604.787313 0 0 1-139.082747 22.263717c-220.607239 0-394.296969-144.615936-394.296969-322.758409s173.526026-322.889372 394.296969-322.889372C1124.219465 333.661082 1309.630388 478.669907 1309.630388 656.550454c0 100.284947-69.344929 189.143369-162.361428 256.130963zM788.070086 511.869037a49.11114 49.11114 0 0 0-46.360916 44.494692 48.783732 48.783732 0 0 0 46.360916 44.494693 52.090549 52.090549 0 0 0 57.983885-44.494693 52.385216 52.385216 0 0 0-57.983885-44.494692z m254.985036 0a48.881954 48.881954 0 0 0-46.09899 44.494692 48.620028 48.620028 0 0 0 46.09899 44.494693 52.385216 52.385216 0 0 0 57.983886-44.494693 52.58166 52.58166 0 0 0-57.951145-44.494692z m-550.568615 150.018161a318.567592 318.567592 0 0 0 14.307712 93.212943c-14.307712 1.080445-28.746387 1.768001-43.283284 1.768001a827.293516 827.293516 0 0 1-162.394168-22.296458l-162.001279 77.955749 46.328175-133.811485C69.410411 600.858422 0 500.507993 0 378.38496 0 166.683208 208.689602 0 463.510935 0c227.908428 0 427.594322 133.18941 467.701752 312.379588a427.463358 427.463358 0 0 0-44.625655-2.619261c-220.24709 0-394.100524 157.74498-394.100525 352.126871zM312.90344 189.143369a64.270111 64.270111 0 0 0-69.803299 55.659291 64.532037 64.532037 0 0 0 69.803299 55.659292 53.694846 53.694846 0 0 0 57.852923-55.659292 53.465661 53.465661 0 0 0-57.852923-55.659291z m324.428188 0a64.040926 64.040926 0 0 0-69.574114 55.659291 64.302852 64.302852 0 0 0 69.574114 55.659292 53.694846 53.694846 0 0 0 57.951145-55.659292 53.465661 53.465661 0 0 0-57.951145-55.659291z" p-id="6275"></path></svg>'
        },
        link: '/wechat.html',
        // You can include a custom label for accessibility too (optional but recommended):
        ariaLabel: 'wechat',
      }
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
      pattern: 'https://github.com/niiKyu/markdown-notes', // 改成自己的仓库
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
    // 组件插入h1标题下
    config: (md) => {
      md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
          let htmlResult = slf.renderToken(tokens, idx, options);
          if (tokens[idx].tag === 'h1') htmlResult += `<ArticleMetadata />`; 
          return htmlResult;
      }
    }
  },
  
})
