var fs = require("fs");
var fileName = "hello2-March-2019.csv";
var res = fs.readFileSync(fileName).toString();

console.log(res);
var res1 = res.split("\n");
console.log(res1);
var header = [];
var data = [];
for(var i in res1) {
  if(i == 0) {
    var res11 = res1[i].split(",");
    for(var j in res11) {
      header.push(res11[j]);
    }
  }
}
console.log(header);
for(var i in res1) {
  if(i > 0) {
    var res11 = res1[i].split(",");
    var data1 = {};
    for(var j in res11) {
      data1[header[j]] = res11[j];
    }
    data.push(data1);
  }
}

console.log(data);
