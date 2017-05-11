var homePath = "";
if(process.env && process.env['HOME']) {
  homePath = process.env['HOME'];
}
var fs = require('fs');
var fx = require('mkdir-recursive');
var transDir = homePath+"/Desktop/transfer";
var tdExists = fs.existsSync(transDir);
if(tdExists) {
  console.log(transDir + ' directory present');
} else {
  console.log(transDir + ' directory not present');
  fx.mkdir(transDir, function(err) {
    console.log('directory created');
  });
}
