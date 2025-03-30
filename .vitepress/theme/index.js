import DefaultTheme from 'vitepress/theme'
import Layout from "./components/Layout.vue"
import ArticleMetadata from "./components/ArticleMetadata.vue"
import './style/index.css'

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
    app.component('ArticleMetadata' , ArticleMetadata)
  },
  Layout,
  
}