# 从Vue源码看Vue如何合并数据

## 两个普通对象的合并

```js
function mergeData (to, from) {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol? Reflect.ownKeys(from): Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}
```