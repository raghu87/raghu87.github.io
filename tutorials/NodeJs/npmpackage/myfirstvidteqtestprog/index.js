var fs = require('fs');
var commandLineArgs = require('command-line-args');

exports._testMsg = function () {
  console.log("This is a message from the demo package1");
}

exports._testMsg.prototype.init = function () {
  console.log('inside init');
}
//exports.testMsg = new exports._testMsg();
