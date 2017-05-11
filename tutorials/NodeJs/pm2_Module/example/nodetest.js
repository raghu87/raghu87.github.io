var homePath = "";
if(process.env && process.env['HOME']) {
  homePath = process.env['HOME'];
}
console.log("inside nodetest ",new Date(),Date.now());
var fs = require('fs');
var fx = require('mkdir-recursive');
var transDir = homePath+"/Desktop/servicetest";
var tdExists = fs.existsSync(transDir);
if(tdExists) {
  console.log(transDir + ' directory present');
  storeFile();
} else {
  console.log(transDir + ' directory not present');
  fx.mkdir(transDir, function(err) {
    console.log('directory created');
    storeFile();
  });
}

function storeFile() {
  fs.writeFile(transDir+"/test"+Date.now(), "Hey there!", function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  }); 
}
