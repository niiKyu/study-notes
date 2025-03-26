# `Vue`

### 基础语法

#### 基础

```html
<body>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <div id="app">
        <!-- v-on:click事件绑定 -->
        <button @click="count++">
            Count is: {{ count }}
        </button>
        <br>
        <!-- v-attr属性绑定 -->
        <span v-text="message"></span>
        <br>
        <!-- v-model双向数据绑定，可以加修饰符
			v-model.lazy	input失焦才更新数据
			v-model.number	自动转换为数字
			v-model.trim	自动去除两端的空格
		-->
        <input v-model="message">
        <br>
        
        <!-- 条件和循环 -->
        <!-- v-if 有更高的切换开销，而 v-show 有更高的初始渲染开销。如果需要频繁切换，则使用 v-show 较好 -->
        <span v-if="(count & 1) == 0">v-if</span>

        <ol>
            <!-- in和of是等价的，js中in是遍历对象的key -->
            <li v-for="(item,index) in items" :key="item.name">{{ index }} - {{ item.name }}</li>
        </ol>
        <!-- 1. 也可以遍历一个对象的属性，(value,name) in object -->
        <!-- 2. n in 10 遍历数字1-10 -->
        <!-- 3. 如果每一次遍历需要创建多个标签，用<template>包裹住
            <template v-for="item in items">
                <li>{{ item.msg }}</li>
                <li class="divider" role="presentation"></li>
            </template>
        -->
        <!-- 4. 警告：同一节点同时使用 v-if 和 v-for 是不推荐的
			在外先包装一层 <template> 再在其上使用 v-for 可以解决这个问题
		-->
        <!-- 5. 强制 使用v-for需要绑定一个key属性，选择对象中唯一的值 -->
        
        <!-- v-html -->
        <!-- v-once 只会变化一次，数据变化也不会改变 -->
    </div>

    <script>
        const app = {
            // 只有data中定义的才是响应式数据
            data() {
                return {
                    count: ref(0),
                    message: ref('Hello Vue!'),
                    items: [{ name: '起床' }, { name: '吃饭' }, { name: '睡觉' }]
                }
            },
            methods: {
                
            }
        }
        const { createApp, ref } = Vue
        Vue.createApp(app).mount('#app')
    </script>
</body>
```

#### 组件

```html
<div id="app">
    <!-- 循环todos中的每一个todoItem，并将todoItem传递给todo-item组件，bind的是子组件的props中定义的属性 -->
    <todo-item v-for="todoItem in todos" v-bind:todo="todoItem"></todo-item>
</div>

<script>
    // 子组件
    const TodoItem = {
        // 定义可以传入的数据
        props: ['todo'],
        // 使用外部数据                   使用内部数据
        template: `<li>{{todo.text}} --- {{user}}</li>`,
        data() {
            return {
                user: 'tom'
            }
        },
        methods: {

        }
    }

    const app = {
        components: {
            TodoItem
        },
        data() {
            return {
                todos: [{text: '起床'}, {text: '吃饭'}, {text: '睡觉'}]
            }
        },
		methods: {
            
        }
    }
    const { createApp, ref } = Vue
    Vue.createApp(app).mount('#app')
</script>
```

#### 生命周期

```javascript
const app = {
    beforeCreate() {
        console.log(`beforeCreate.---`+this.life+`---`+document.getElementById('life'))
    },
    created() {
        console.log(`created.---`+this.life+`---`+document.getElementById('life'))
    },
    beforeMount() {
        console.log(`beforeMount.---`+this.life+`---`+document.getElementById('life'))
    },
    mounted() {
        console.log(`mounted.---`+this.life+`---`+document.getElementById('life'))
    }
}
const { createApp, ref } = Vue
Vue.createApp(app).mount('#app')
```

#### 计算属性和侦听器

```html
<div id="app">
    <input type="text" v-model="firstName">
    <input type="text" v-model="lastName">
    <p>{{ fullName }}</p>
</div>

<script>
    const app = {
        data() {
            return {
                firstName: 'John',
                lastName: 'Doe'
            }
        },
        methods: {

        },
        // 计算属性，作用：代码抽离，相对于methods有缓存，性能更高
        computed: {
            fullName() {
                return this.firstName + ' ' + this.lastName
            }
        }，
        // 侦听器，每当answer这个数据变化，就会调用，自动传入新值旧值
        watch: {
            answer(newData, oldData) {

            }
        }
    }
    const { createApp, ref } = Vue
    Vue.createApp(app).mount('#app')
</script>
```

#### style和class绑定

```html
<!-- 
1. active 是否存在取决于数据属性 isActive 的真假值。active是css样式，isActive是data中的变量
2. :class 指令也可以和一般的 class 共存
-->
<div :class="{ active: isActive }"></div>
<!--绑定的对象并不一定需要写成内联字面量的形式，也可以直接绑定一个对象：-->
classObject: {
  active: true,
  'text-danger': false
}
<div :class="classObject"></div>
<!--绑定数组，activeClass, errorClass是data中的变量-->
<div :class="[activeClass, errorClass]"></div>
```

```html
activeColor: 'red'
fontSize: 30
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
<!--style跟class一样可以绑定对象和数组-->
```

#### 事件绑定

```html
<!-- 1. v-on:事件绑定的methods中会自动传入event对象，我们可以通过它获取dom元素的所有内容
    <button @click="say"></button>
    methods: {
        say(event){},
    }
    2. 如果我们需要传入参数，需要显式的传入$event对象
    <button @click="say('hi', $event)"></button>
    methods: {
        say(message,event){},
    }
    3. 还可以调用多个方法，需要显式传入$event？
    <button @click="say('hi', $event), two($event)"></button>
-->
```

##### 事件修饰符

```html
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>
```

```html
<!-- 原本表单点击submit会刷新页面，使用@submit.prevent阻止了刷新和提交，并调用了onSubmit方法，在方法中提交表单更方便 -->
<form action="" method="post" @submit.prevent="onSubmit">
    <input type="text" v-model="user.username"><br>
    <input type="text" v-model="user.password"><br>
    <input type="submit"></input><br>
</form>
```

##### 按键修饰符

```html
<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
```

- `.enter`
- `.tab`
- `.delete` (捕获“Delete”和“Backspace”两个按键)
- `.esc`
- `.space`
- `.up`
- `.down`
- `.left`
- `.right`

```html
<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + 点击 -->
<div @click.ctrl="doSomething">Do something</div>
```

`.exact` 修饰符允许精确控制触发事件所需的系统修饰符的组合。

```html
<!-- 当按下 Ctrl 时，即使同时按下 Alt 或 Shift 也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 仅当按下 Ctrl 且未按任何其他键时才会触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 仅当没有按下任何系统按键时触发 -->
<button @click.exact="onClick">A</button>
```

**鼠标按键修饰符**

- `.left`
- `.right`
- `.middle`

#### 表单输入绑定

多行文本

```html
<span>Multiline message is:</span>
<p style="white-space: pre-line;">{{ message }}</p>
<textarea v-model="message" placeholder="add multiple lines"></textarea>
```

复选框

```html
<div>Checked names: {{ checkedNames }}</div>

<input type="checkbox" id="jack" value="Jack" v-model="checkedNames" />
<label for="jack">Jack</label>

<input type="checkbox" id="john" value="John" v-model="checkedNames" />
<label for="john">John</label>

<input type="checkbox" id="mike" value="Mike" v-model="checkedNames" />
<label for="mike">Mike</label>
```

单选按钮

```html
<!-- 由v-model确定分组，v-model相同的为一组单选按钮 -->
<div>Picked: {{ picked }}</div>

<input type="radio" id="one" value="One" v-model="picked" />
<label for="one">One</label>

<input type="radio" id="two" value="Two" v-model="picked" />
<label for="two">Two</label>
```

选择器

```html
<div>Selected: {{ selected }}</div>

<select v-model="selected">
  <option disabled value="">Please select one</option>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
```

复选框

```html
<div>Selected: {{ selected }}</div>

<select v-model="selected" multiple>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
```

### JavaScript异步同步

#### Promise

同步异步函数

```js
//异步执行
setTimeout(()=>{
    console.log('广东省')
    resolve('广东省')
},1000);
setTimeout(() => {
    console.log(res + '深圳市');
    resolve(res + '深圳市')
},1000);
setTimeout(() => {
    console.log(res + '宝安区');
    resolve(res + '宝安区')
},1000);

//同步执行
new Promise((resolve,reject)=>{
    setTimeout(()=>{
        console.log('广东省')
        resolve('广东省')
    },1000);
}).then(res => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            console.log(res + '深圳市');
            resolve(res + '深圳市')
        },1000);
    })
}).then(res => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            console.log(res + '宝安区');
            resolve(res + '宝安区')
        },1000);
    })
}).catch(error => {
    console.log(error);
})
```

#### await async语法

```js
//只有 async 函数中才能使用 await 语法
//await 函数必须返回一个 Promise 对象，resolve 传入的值就是 return 值
let count = 0;
let fun1 = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('fun1')
            resolve(count+10);
        }, 2000);
    })
}

async function fun2() {
    let result = await fun1();
    console.log(result);
}

fun2();
```

### vue脚手架

```sh
# 安装vue脚手架
npm install yarn -g
yarn config set registry https://registry.npmmirror.com/
yarn global add @vue/cli

vue create xxx
cd xxx
yarn serve
```

### Vue-router

```sh
yarn add vue-router@4
```

#### 入门

通过配置**路由**来告诉 Vue Router 为每个 URL 路径显示哪些组件。

```vue
<!--使用 router-link 组件进行导航 -->
<!--通过传递 `to` 来指定链接 -->
<!--`<router-link>` 将呈现一个带有正确 `href` 属性的 `<a>` 标签-->
<router-link to="/">Go to Home</router-link>|
<router-link to="/about">Go to About</router-link>|
<!-- 路由出口 --><!-- 路由匹配到的组件将渲染在这里 -->
<router-view></router-view>
```

./router/index.js

```js
import { createMemoryHistory, createRouter } from 'vue-router'
import AboutPage from '../components/AboutPage.vue'
import HomePage from '../components/HomePage.vue'

const routes = [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
]
const router = createRouter({
    history: createMemoryHistory(),
    routes,
})
export default router
```

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
createApp(App).use(router).mount('#app')
```

#### 动态路由匹配

```js
const routes = [
  // 动态字段以冒号开始
  { path: '/users/:id', component: User },
]
```

现在像 `/users/johnny` 和 `/users/jolyne` 这样的 URL 都会映射到同一个路由。

```vue
<template>
  <div>
    <!-- 当前路由可以通过 $route 在模板中访问 -->
    User {{ $route.params.id }}
  </div>
</template>
```

还可以使用正则，`orderId` 总是一个数字

```js
const routes = [
  // /:orderId -> 仅匹配数字
  { path: '/:orderId(\\d+)' },
  // /:productName -> 匹配其他任何内容
  { path: '/:productName' },
]
```

```js
const routes = [
  // /:chapters ->  匹配 /one, /one/two, /one/two/three, 等 （1 个或多个）
  { path: '/:chapters+' },
  // /:chapters -> 匹配 /, /one, /one/two, /one/two/three, 等 （0 个或多个）
  { path: '/:chapters*' },
]
// $route.params.chapters 获取的将是数组 ['one','two']
```

```js
const routes = [
  // 匹配 /users 和 /users/posva (0 个或 1 个)
  { path: '/users/:userId?' },
  // 匹配 /users 和 /users/42
  { path: '/users/:userId(\\d+)?' },
]
```

#### 嵌套路由

我们需要在路由中配置 `children`：

```js
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染到 User 的 <router-view> 内部
        path: 'profile',
        component: UserProfile,
      },
      {
        // 当 /user/:id/posts 匹配成功
        // UserPosts 将被渲染到 User 的 <router-view> 内部
        path: 'posts',
        component: UserPosts,
      },
    ],
  },
]
```

#### 路由命名

当创建一个路由时，我们可以选择给路由一个 `name`：

```js
const routes = [
  {
    path: '/user/:username',
    name: 'profile', 
    component: User
  }
]
```

然后我们可以使用 `name` 而不是 `path` 来传递 `to` 属性给 `<router-link>`：

```vue
<router-link :to="{ name: 'profile', params: { username: 'erina' } }">
  User profile
</router-link>
```

上述示例将创建一个指向 `/user/erina` 的链接。

#### 视图命名

有时候想同时 (同级) 展示多个视图，而不是嵌套展示。如果 `router-view` 没有设置名字，那么默认为 `default`。

```vue
<router-view class="view left-sidebar" name="LeftSidebar" />
<router-view class="view main-content" />
<router-view class="view right-sidebar" name="RightSidebar" />
```

一个视图使用一个组件渲染，因此对于同个路由，多个视图就需要多个组件。确保正确使用 components 配置 (带上 s)：

```js
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      components: {
        default: Home,
        // LeftSidebar: LeftSidebar 的缩写
        LeftSidebar,
        // 它们与 `<router-view>` 上的 `name` 属性匹配
        RightSidebar,
      },
    },
  ],
})
```

#### 编程式导航

利用js主动的跳转到某一个路由上，可以使用 `router.push` 方法。

```js
// 字符串路径
router.push('/users/eduardo')

// 带有路径的对象
router.push({ path: '/users/eduardo' })

// 命名的路由，并加上参数，让路由建立 url
router.push({ name: 'user', params: { username: 'eduardo' } })

// 带查询参数，结果是 /register?plan=private
router.push({ path: '/register', query: { plan: 'private' } })
```

**注意**：如果提供了 `path`，`params` 会被忽略，上述例子中的 `query` 并不属于这种情况。取而代之的是下面例子的做法，你需要提供路由的 `name` 或手写完整的带有参数的 `path` ：

```js
const username = 'eduardo'
// 我们可以手动建立 url，但我们必须自己处理编码
router.push(`/user/${username}`) // -> /user/eduardo
// 同样
router.push({ path: `/user/${username}` }) // -> /user/eduardo
// 如果可能的话，使用 `name` 和 `params` 从自动 URL 编码中获益
router.push({ name: 'user', params: { username } }) // -> /user/eduardo
// `params` 不能与 `path` 一起使用
router.push({ path: '/user', params: { username } }) // -> /user
```

`router.replace`的作用类似于 `router.push`，唯一不同的是，它在导航时不会向 history 添加新记录

```js
router.push({ path: '/home', replace: true })
// 相当于
router.replace({ path: '/home' })
```

在历史堆栈中前进或后退多少步，类似于 `window.history.go(n)`。

```js
// 向前移动一条记录，与 router.forward() 相同
router.go(1)

// 返回一条记录，与 router.back() 相同
router.go(-1)

// 前进 3 条记录
router.go(3)

// 如果没有那么多记录，静默失败
router.go(-100)
router.go(100)
```

#### 重定向和别名

```js
const routes = [{ path: '/home', redirect: '/' }]
const routes = [{ path: '/home', redirect: { name: 'homepage' } }]
// 相对重定向，将总是把/users/123/posts重定向到/users/123/profile。相对位置不以`/`开头
const routes = [{ path: '/users/:id/posts',redirect: { path: 'profile'} }]
```

```js
const routes = [{ path: '/', component: Homepage, alias: '/home' }]
const routes = [
  {
    path: '/users',
    component: UsersLayout,
    children: [
      // 为这 3 个 URL 呈现 UserList
      // - /users
      // - /users/list
      // - /people
      { path: '', component: UserList, alias: ['/people', 'list'] },
    ],
  },
]
const routes = [
  {
    path: '/users/:id',
    component: UsersByIdLayout,
    children: [
      // 为这 3 个 URL 呈现 UserDetails
      // - /users/24
      // - /users/24/profile
      // - /24
      { path: 'profile', component: UserDetails, alias: ['/:id', ''] },
    ],
  },
]
```

#### 路由组件传参

我们之前使用`$route`传参

```vue
<template>
  <div>
    User {{ $route.params.id }}
  </div>
</template>
```

然后我们可以通过设置 `props: true` 来配置路由将 `id` 参数作为 prop 传递给组件：

```vue
<template>
  <div>
    User {{ id }}
  </div>
</template>

<script>
export default {
  name: 'User',
  props: ['id']
}
</script>
```

```js
const routes = [
  { path: '/user/:id', component: User, props: true }
]
```

当 `props` 设置为 `true` 时，`route.params` 将被设置为组件的 props。

------

如果使用了多个视图components，你必须为每个命名视图定义 `props` 配置：

```js
const routes = [
  {
    path: '/user/:id',
    components: { default: User, sidebar: Sidebar },
    props: { default: true, sidebar: false }
  }
]
```

------

当 `props` 是一个对象时，它会将此对象设置为组件的 props，而不是`route.params`，也就是静态数据

```js
const routes = [
  {
    path: '/promotion/from-newsletter',
    component: Promotion,
    props: { newsletterPopup: false }
  }
]
```

或使用函数返回一个对象

```js
const routes = [
  {
    path: '/search',
    component: SearchUser,
    props: route => ({ query: route.query.q })
  }
]
```

#### 不同的历史模式（#路径）

hash 模式是用 `createWebHashHistory()` 创建的：

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    //...
  ],
})
```

它在内部传递的实际 URL 之前使用了一个井号（`#`）。由于这部分 URL 从未被发送到服务器，所以它不需要在服务器层面上进行任何特殊处理。不过，**它在 SEO 中确实有不好的影响**。如果你担心这个问题，可以使用 HTML5 模式。

用 `createWebHistory()` 创建 HTML5 模式，推荐使用这个模式：

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    //...
  ],
})
```

#### 导航守卫（过滤器）

你可以使用 `router.beforeEach` 注册一个全局前置守卫：

```js
const router = createRouter({ ... })

router.beforeEach((to, from) => {
  // ...
  // 返回 false 以取消导航
  return false
})
```

-------

你可以直接在路由配置上定义 `beforeEnter` 守卫：

```js
const routes = [
  {
    path: '/users/:id',
    component: UserDetails,
    beforeEnter: (to, from) => {
      // reject the navigation
      return false
    },
  },
]
```

------

最后，你可以在路由组件内直接定义路由导航守卫(传递给路由配置的)

- `beforeRouteEnter`
- `beforeRouteUpdate`
- `beforeRouteLeave`

```vue
<script>
export default {
  beforeRouteEnter(to, from) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能获取组件实例 `this` ！
    // 因为当守卫执行时，组件实例还没被创建！
  },
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 `/users/:id`，在 `/users/1` 和 `/users/2` 之间跳转的时候，
    // 由于会渲染同样的 `UserDetails` 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 因为在这种情况发生的时候，组件已经挂载好了，导航守卫可以访问组件实例 `this`
  },
  beforeRouteLeave(to, from) {
    // 在导航离开渲染该组件的对应路由时调用
    // 与 `beforeRouteUpdate` 一样，它可以访问组件实例 `this`
  },
}
</script>
```

#### 动态路由

动态路由主要通过两个函数实现。`router.addRoute()` 和 `router.removeRoute()`。

```js
router.addRoute({ path: '/about', component: About })
```

**删除路由**

通过调用 `router.addRoute()` 返回的回调，当路由没有名称时，这很有用。

```js
const removeRoute = router.addRoute(routeRecord)
removeRoute() // 删除路由如果存在的话
```

通过使用 `router.removeRoute()` 按名称删除路由：

```js
router.addRoute({ path: '/about', name: 'about', component: About })
// 删除路由
router.removeRoute('about')
```

当路由被删除时，**所有的别名和子路由也会被同时删除**

**查看现有路由**

Vue Router 提供了两个功能来查看现有的路由：

- [`router.hasRoute()`](https://router.vuejs.org/zh/api/interfaces/Router.html#Methods-hasRoute)：检查路由是否存在。
- [`router.getRoutes()`](https://router.vuejs.org/zh/api/interfaces/Router.html#Methods-getRoutes)：获取一个包含所有路由记录的数组。

#### vue.config.js反向代理（跨域）

```js
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 前端项目启动在8080端口
    port: 8080,
    // 代理到这个地址，前端访问http://localhost:8080/admin/user/1就能访问到http://localhost:8088/admin/user/1
    proxy:  'http://localhost:8088'
  }
})
```

### Vuex（全局的变量、方法、计算属性）

```sh
yarn add vuex@next --save
```

```js
import { createApp } from 'vue'
import { createStore } from 'vuex'

// 创建一个新的 store 实例
const store = createStore({
//全局变量
  state () {
    return {
      count: 0
    }
  },
//全局方法，类似dao层，只操作全局变量
//如果需要传参，在第二个参数传入一个对象
//强制 必须是同步的
  mutations: {
    increment (state) {
      state.count++
    }
  },
//全局计算属性
  getters: {
    doneTodosCount(state,getters) {
        
    }
  },
//全局方法，类似service，做一些复杂业务
//context可以替换为{ commit, state }
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})

const app = createApp({ /* 根组件 */ })

// 将 store 实例作为插件安装
app.use(store)
```

通过 `store.state` 来获取状态对象，并通过 `store.commit` 方法触发状态变更

```js
this.$store.commit('increment')
console.log(this.$store.state.count)
```

#### 在 Vue 组件中获得 Vuex 状态

在组件中获取全局变量推荐写在计算属性中：

```js
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
```

**`mapState`、`mapGetters`、`mapActions` 辅助函数**

如果需要获取的全局变量太多，可以使用mapState简写，与上面等效，全局计算属性同理使用`mapGetters`

```js
computed: {
  localComputed () { /* ... */ },
  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState([
    // 映射 this.count 为 store.state.count
    'count'
  ]),
  ...mapGetters([
      'doneCount'
  ])
}
```

```js
methods: {
  ...mapActions([
    'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`
    // `mapActions` 也支持载荷：
    'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
  ]),
  ...mapActions({
    add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
  })
}
```

#### 项目结构

当项目变得庞大之后，Vue建议把 Vuex 相关代码分割到模块中。

```sh
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    └── modules
        ├── cart.js       # 购物车模块
        └── products.js   # 产品模块
```

#### Module

```js
const moduleA = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... }
}

const store = createStore({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

### setup组合式API

```vue
<script>
import {ref, onMounted} from 'vue';
export default {
    setup(){
        //props
        const countRef = toRef(state, 'count');
        //data
        let count = ref(0);
        //methods
        function myFn(){
            console.log(count);
            count.value += 1;
        }
       //mounted
        onMounted(() => console.log('component mounted!'));
        //computed
        const doubledCount = computed(() => count.value * 2)
        //watch
        watch(count, (newCount) => { console.log(newCount) })
        //$this.router
        const router = useRouter()
        //$this.route
        const route = useRoute()
        return {count,myFn}
    }
}
</script>
```

更简化的写法，只要定义就会自动导出

```vue
<script setup>
import {ref, onMounted} from 'vue';

//props
const countRef = toRef(state, 'count');
//data
let count = ref(0);
//methods
function myFn(){
    console.log(count);
    count.value += 1;
}
//mounted
onMounted(() => console.log('component mounted!'));
//computed
const doubledCount = computed(() => count.value * 2)
//watch
watch(count, (newCount) => { console.log(newCount) })

</script>
```

### element-plus

```sh
yarn add element-plus
```

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
```

```sh
├── components
│   ├── App.vue
│   └── ...
├── assets
│   ├── img
│   │   └── .png
│   └── style # 全局css
│       └── common.css # 全局css
└── router
    └── index.vue
```

### sessionStorage和localStorage

vuex的数据，页面刷新就被销毁

sessionStorage，浏览器关闭就被销毁

localStorage，长期保存

```js
export default {
    put(key,value){
    	window.sessionStorage.setItem(key,value)
    },
    get(key){
        return window.sessionStorage.getItem(key)
    },
    putObject(key,value){
        put(key,JSON.stringify(value))
    },
    getObject(key){
        return JSON.parse(get(key))
    },
    remove(key){
        return window.sessionStorage.removeItem(key)
    }
}

```

