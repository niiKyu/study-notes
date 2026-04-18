# Live2d

## pixi-live2d-display

### 下载live2d的sdk

- 下载地址：https://www.live2d.com/zh-CHS/sdk/download/web/
- 因为是web项目，所以下载这个版本
- 打开页面，滑动到最底下
- 下载图示

![img](..\img\v2-098c8e409226a60a79705a6d039d2e73_1440w.BMbVfKfz.jpg)

### 在index.html引入

把下载好的live2d的sdk存放在public文件夹中，再在index.html文件中使用script引入

![img](..\img\v2-169558ead75ba6670c019659e10f82a0_1440w.CT7GTrcW.jpg)

### pixi-live2d-display使用

需要注意版本：pixi.js 不能超过6

如下安装：

```js
yarn add pixi-live2d-display@0.4.0

yarn add pixi.js@6.5.10
```

### 简单版代码

不赘述，很简单

```html
<template>
  <div class="canvasWrap">
    <canvas id="myCanvas" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4"; // 只需要 Cubism 4

window.PIXI = PIXI; // 为了pixi-live2d-display内部调用

let app; // 为了存储pixi实例
let model; // 为了存储live2d实例

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  app = null;
  model = null;
});

const init = async () => {
  // 创建PIXI实例
  app = new PIXI.Application({
    // 指定PixiJS渲染器使用的HTML <canvas> 元素
    view: document.querySelector("#myCanvas"),
    // 响应式设计
    resizeTo: document.querySelector("#myCanvas"),
    // 设置渲染器背景的透明度 0（完全透明）到1（完全不透明）
    backgroundAlpha: 0,
  });
  // 引入live2d模型文件
  model = await Live2DModel.from("/live2d/Haru/Haru.model3.json", {
    autoInteract: false, // 关闭眼睛自动跟随功能
  });
  // 调整live2d模型文件缩放比例（文件过大，需要缩小）
  model.scale.set(0.12);
  // 调整x轴和y轴坐标使模型文件居中
  model.y = 0;
  model.x = -24;
  // 把模型添加到舞台上
  app.stage.addChild(model);
};
</script>

<style lang="less" scoped>
#myCanvas {
  width: 240px;
  height: 360px;
}
</style>
```

### 丛雨

```vue
<template>
  <div class="page-container">
    <!-- 其他内容可以放在这里 -->

    <div class="live2d-wrapper">
      <div
        class="live2d-container"
        @mouseenter="showButtons = true"
        @mouseleave="showButtons = false"
      >
        <canvas id="myCanvas" />

        <!-- 文本气泡 -->
        <div v-if="motionText" class="motion-bubble">{{ motionText }}</div>

        <!-- 浮动按钮组 -->
        <transition name="fade">
          <div v-show="showButtons" class="floating-buttons">
  <button
    v-for="(btn, index) in buttons"
    :key="index"
    class="floating-btn"
    :style="{ backgroundColor: btn.color }"
    @click="motionFn(btn.index)"
  >
    <i class="fas fa-play" style="font-size: 10px;"></i> <!-- Font Awesome 图标 -->
    {{ btn.label }}
  </button>          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4"; // 只需要 Cubism 4

// const audioFile = "/murasame/sounds/1.wav";
// import audioFile from "@/assets/sounds/jp2.wav";
// import audioFile from "@/assets/sounds/xiaosan.mp3";
// import audioFile from "@/assets/sounds/girlSing.mp3";

window.PIXI = PIXI; // 为了pixi-live2d-display内部调用

let app = null; // 为了存储pixi实例
let model = null; // 为了存储live2d实例
let audioContext = null; // 为了存储音频处理实例

let isPlayingMotion = false;
onMounted(() => {
  init(); // 初始化
});

const init = async () => {
  // 创建音频处理实例
  audioContext = new AudioContext();
  // 创建PIXI实例
  app = new PIXI.Application({
    // 指定PixiJS渲染器使用的HTML <canvas> 元素
    view: document.querySelector("#myCanvas"),
    // 响应式设计
    resizeTo: document.querySelector("#myCanvas"),
    // 设置渲染器背景的透明度 0（完全透明）到1（完全不透明）
    backgroundAlpha: 0,
  });
  // 引入live2d模型文件
  model = await Live2DModel.from("/murasame/Murasame.model3.json", {
    autoInteract: true, // 关闭眼睛自动跟随功能（默认为true）
    autoUpdate: true, // 开启人物自动变化（默认为true）
  });
  // 调整live2d模型文件缩放比例（文件过大，需要缩小）
  model.scale.set(0.12);
  // 调整x轴和y轴坐标使模型文件居中
  model.y = 0;
  model.x = 12;
  // 把模型添加到舞台上
  app.stage.addChild(model);

  // 点击人物事件，需autoInteract为true才能触发
  model.on("hit", (hitAreaNames) => {
    console.log("hitAreaNames", hitAreaNames);
    let randomMotion = Math.floor(Math.random() * motionList.length - 1) + 1;
    motionFn(randomMotion);
  });
  // 在 init() 内部 model 加载完成后添加：
  app.ticker.add(() => {
    if (model && model.internalModel && model.internalModel.motionManager) {
      const motionManager = model.internalModel.motionManager;

      if (isPlayingMotion) {
        // 如果当前没有在播放动画了
        if (motionManager.isFinished()) {
          motionText.value = ""; // 清空文本
          isPlayingMotion = false;
        }
      }
    }
  });
};

const showButtons = ref(false);

// 按钮配置：可自定义图标、颜色、标签
const buttons = [
  { label: "💬", color: "#4ECDC4", index: 1 },
  { label: "💬", color: "#45B7D1", index: 2 },
  { label: "💬", color: "#96CEB4", index: 3 },
  { label: "💬", color: "#FFEEAD", index: 4 },
  { label: "💬", color: "#C5B786", index: 5 },
  { label: "💬", color: "#EE6C4D", index: 6 },
  { label: "💬", color: "#A3A3E6", index: 7 },
  { label: "💬", color: "#F79292", index: 8 },
  { label: "💬", color: "#FAC898", index: 9 },
  { label: "💬", color: "#A6DAAD", index: 10 },
  { label: "💬", color: "#D1A0C4", index: 11 },
];
const motionList = [
  {
    group: "Idle",
    index: 0,
    text: "",
  },
  {
    group: "Tapface",
    index: 0,
    text: "吾名丛雨，乃是这“丛雨丸”的管理者……简单来说，也算是“丛雨丸”的灵魂",
  },
  {
    group: "Tapface",
    index: 1,
    text: "你，就是本座的主人？",
  },
  {
    group: "Taphair",
    index: 0,
    text: "在这里，这里",
  },
  {
    group: "Taphair",
    index: 1,
    text: "你看，复原了",
  },
  {
    group: "Tapxiongbu",
    index: 0,
    text: "主人就是主人。是你拔出了丛雨丸吧？",
  },
  {
    group: "Tapxiongbu",
    index: 1,
    text: "你这————！！",
  },
  {
    group: "Tapqunzi",
    index: 0,
    text: "——着陆",
  },
  {
    group: "Tapqunzi",
    index: 1,
    text: "本座才不是幽灵！完全不是！不要把幽灵和本座相提并论！",
  },
  {
    group: "Tapleg",
    index: 0,
    text: "哪是什么幽灵，别……别别别把本座和那种毫无事实依据的东西混为一谈",
  },
  {
    group: "Tapleg",
    index: 1,
    text: "你醒了吗，主人。早上好",
  },
  {
    group: "Tapleg",
    index: 2,
    text: "本座不是幻觉，更不是幽灵，主人！",
  },
];
const motionText = ref("");
const motionFn = async (motionIndex) => {
  if (!model) return;
  let motion = motionList[motionIndex];
  // 记录我们正在播放动作
  isPlayingMotion = true;
  // 显示文本
  motionText.value = motion.text;
  model.motion(motion.group, motion.index).then((success) => {
    if (!success) {
      // 如果动作未能成功播放，也清空文本
      motionText.value = "";
      isPlayingMotion = false;
    }
  });
};

onBeforeUnmount(() => {
  model?.destroy();
  model = null;
  app?.destroy();
  app = null;
  audioContext?.close();
  audioContext = null;
});
</script>

<style lang="less" scoped>
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.live2d-wrapper {
  position: fixed;
  right: 20px; // 距离右边距
  bottom: 0px; // 距离底部边距
  z-index: 9999; // 确保在其他元素之上
  pointer-events: auto;
}

.live2d-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

#myCanvas {
  width: 240px;
  height: 360px;
}

.motion-bubble {
  position: absolute;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  width: 200px;
  text-align: center;
  z-index: 20;
  pointer-events: none;

  animation: floatUp 3s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.floating-buttons {
  position: absolute;
  top: 30%;
  right: 100%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 6px;
  border-radius: 10px;

}

.floating-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: scale(1.1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```