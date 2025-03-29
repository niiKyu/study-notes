import DefaultTheme from 'vitepress/theme'
import L2D from "./components/L2D.vue"
import DataPanel from "./components/DataPanel.vue"
import './style/index.css'

import { h } from 'vue'
import { inBrowser } from 'vitepress'
import busuanzi from 'busuanzi.pure.js'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app, router  }) {
    if (inBrowser) {
      router.onAfterRouteChange = () => {
        busuanzi.fetch()
      }
    }
    // 注册不蒜子 浏览量展示
    app.component('L2D',L2D)
    app.component('DataPanel' , DataPanel)
  },

  Layout() { 
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(DataPanel), //不蒜子layout-bottom插槽
    })
  },
}