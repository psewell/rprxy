// character table string
const b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function encode (data) {
	var output = "";
	var base = b.length;
  while (data > 0) {
    var ch = data % base
		output = (b.substring(ch, ch + 1)) + output
		data = Math.floor(data / base)
  }
	return output;
}

module.exports = encode;