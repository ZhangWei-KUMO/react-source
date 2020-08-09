const CN = Symbol("China");
const US = Symbol("United State");
const JS = Symbol("Japan");
const countries = {
  [CN]: "中国",
  [US]: "美国",
  [JS]: "日本"
}

console.log(countries[CN]);