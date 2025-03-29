<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const script = document.createElement("script");
  script.src = "./lib/L2Dwidget.min.js";
  script.onload = () => {
    L2Dwidget.init({model: { jsonPath: "./assets/asuna_04.model.json" }});
  }
  document.head.appendChild(script);
});
</script>

<template>
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

<style scoped>
</style>