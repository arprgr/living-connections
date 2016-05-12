// Read a file one line at a time, synchronously.
// Works only on ASCII files today.

var fs = require("fs");

var bufferSize = 1024;

function LineReader(inFileName) {
  this.fd = fs.openSync(inFileName, "r");
	this.leftover = "";
	this.buffer = new Buffer(bufferSize);
}

LineReader.prototype = {
	readLine: function() {
		var self = this;
		var eol, line, cc;
		for (;;) {
			eol = self.leftover.indexOf("\n");
			if (eol >= 0) {
				line = self.leftover.substring(0, eol);
				self.leftover = self.leftover.substring(eol + 1);
				break;
			}
			cc = fs.readSync(self.fd, self.buffer, 0, bufferSize, null);
			if (cc <= 0) {
				if (self.leftover.length) {
					line = self.leftover;
					self.leftover = "";
				}
				break;
			}
			self.leftover += self.buffer.toString("ascii", 0, cc);
		}
		return line;
	},
	close: function() {
		this.leftover = "";
		fs.close(this.fd);
	}
};

module.exports = {
	LineReader: LineReader
};
