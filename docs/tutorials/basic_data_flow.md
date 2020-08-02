---
category: 教程
order: 3
type: react-source 必考点
title: react-source基础数据流
---

在第1部分：react-source概述和概念中，我们介绍了react-source如何通过为我们提供一个放置全局应用程序状态的中央位置来帮助我们构建可维护的应用程序。我们还讨论了react-source的核心概念，例如调度动作对象，使用返回新状态值的reducer函数以及使用thunk编写异步逻辑。

在第2部分：react-source应用程序的结构，我们看到**react-source Toolkit**的API`configureStore`和`createSlice` 与 **React-react-source**中的`Provider`和`useSelector`是如何配合工作的。

## 项目设置

在本教程中，我们创建了一个预配置的入门项目，该项目已经设置了React和react-source，包括一些默认样式，并且具有伪造的REST API，可让我们在应用中编写实际的API请求。您将以此为基础编写实际的应用程序代码。

```js
// app.js
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { Navbar } from './app/Navbar'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <section>
                <h2>Welcome to the react-source Essentials example app!</h2>
              </section>
            )}
          />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  )
}

export default App
      
```

一起看下项目结构吧:

* /src
   * index.js: 应用的入口文件. 他会渲染 <Provider> 组件和主组件main <App> .
   * App.js: 应用的主组件. 渲染客户端路由
   * index.css: 样式
* /api
  * client.js: 通过AJAX Get/Post数据
  * server.js: 提供数据的FAKE REST API.
* /app
  * Navbar.js: 导航
  * store.js: react-source store实例
  

下面让我们开始吧！

## 主功能实现

我们的社交媒体供稿应用程序的主要功能是帖子列表。我们将继续为该功能添加一些功能，但首先，我们的首要目标是仅在屏幕上显示帖子条目列表。

## 创建贴子切片

第一步是创建一个新的react-source“切片”，其中将包含我们发布的数据。一旦我们在react-source存储中存储了这些数据，就可以创建React组件以在页面上显示该数据。

在src内，创建一个新的`features`文件夹，在`features`内放置一个`posts`文件夹，并添加一个名为`postsSlice.js`的新文件。

如果要呈现帖子列表，则需要从某处获取数据。 React组件可以使用React-react-source库中的`useSelector`钩子从react-source store中读取数据。您编写的“selector functions”将以整个react-source state对象作为参数来调用，并且应从存储中返回该组件所需的特定数据。

我们最初的`PostsList`组件将从**react-source store**中读取`state.posts`值，然后循环遍历所有帖子并在屏幕上显示它们：

```js
// features/posts/PostsList.js
import React from 'react'
import { useSelector } from 'react-react-source'

export const PostsList = () => {
  const posts = useSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt">
      <h3>{post.title}</h3>
      <p>{post.content.substring(0, 100)}</p>
    </article>
  ))

  return (
    <section>
      <h2>Posts</h2>
      {renderedPosts}
    </section>
  )
}
```

然后，我们需要更新`App.js`中的路由，以便显示`PostsList`组件而不是“ welcome”消息。将`PostsList`组件导入`App.js`，并将欢迎文本替换为<PostsList />。我们还将把它包装在React Fragment中，因为我们很快就会在主页上添加其他内容

```js
// App.js
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'

import { Navbar } from './app/Navbar'

+ import { PostsList } from './features/posts/PostsList'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
+             <React.Fragment>
+              <PostsList />
+             </React.Fragment>
            )}
          />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  )
}

export default App
```

## 添加新贴

创建一个叫`AddPostForm.js`文件

```js
// features/posts/AddPostForm.js
import React, { useState } from 'react'

export const AddPostForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button">Save Post</button>
      </form>
    </section>
  )
}
```
导入 `App.js` 文件中
```js
<Route
  exact
  path="/"
  render={() => (
    <React.Fragment>
 +     <AddPostForm />
      <PostsList />
    </React.Fragment>
  )}
/>
```