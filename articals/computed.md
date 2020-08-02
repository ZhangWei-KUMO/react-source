# Vue计算属性和侦听

在使用模板的时候我们经常会使用使用到模板双向绑定，但除非是纯粹的字符串或数据，稍微复杂的数据我们都会在computed属性中计算返回。

```js
<div>
  {{reversedMessage}}
</div>

var vm = new Vue({
  data: {
    message: 'Hello'
  },
  computed: {
    reversedMessage: function () {
      return this.message.split('').reverse().join('')
    }
  }
})
```