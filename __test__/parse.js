var cssText = "width;";
function repeat(str, n) {
  let result = ''
  if (n > 0) {
    while (true) {
      if (n & 1) result += str
      n >>>= 1
      if (n <= 0) break
      str += str
    }
  }
  return result
}


let r = repeat(cssText, 4);


