/* util/random.js */

const DIGITS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function digits(len, radix) {
  radix = radix || 10;
  var src = DIGITS.substring(0, radix);
  var result = "";
  for (var i = 0; i < len; ++i) {
    result += src[Math.floor(Math.random() * src.length)];
  }
  return result;
}

module.exports = {
  digits: digits
}
