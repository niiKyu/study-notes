<script setup>
import DefaultTheme from "vitepress/theme";
import { onMounted } from "vue";
const { Layout } = DefaultTheme;

// Live2D
onMounted(() => {
  const script = document.createElement("script");
  script.src = "/lib/L2Dwidget.min.js";
  script.onload = () => {
    L2Dwidget.init({ model: { jsonPath: "/assets/asuna_04.model.json" } });
  };
  document.head.appendChild(script);
});
</script>

<template>
  <Layout>
    <!-- 不蒜子插槽 -->
    <template #layout-bottom>
      <div class="busuanzi">
        本站访客数 <span id="busuanzi_value_site_uv" /> 人次 本站总访问量
        <span id="busuanzi_value_site_pv" /> 次
      </div>
      <!-- Live2D插槽 -->
      <div
        style="
          width: 70%;
          height: 46px;
          bottom: 0;
          position: fixed;
          line-height: 46px;
          color: aliceblue;
          text-align: center;
        "
      ></div>
    </template>

    <!-- 插槽1 -->
    <template #layout-top> </template>
  </Layout>
</template>

<style>
.busuanzi {
  font-size: 15px;
  color: gray;
  text-align: center;
}
</style>