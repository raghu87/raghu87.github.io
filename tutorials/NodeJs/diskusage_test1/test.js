const exec = require('child_process').exec; 
var src = "df -Ph /media/intel/SSD7 | awk '{print $1\",\"$2\",\"$3\",\"$4\",\"$5\",\"$6}'";
var finalRes = [];
exec(src,(err,stdout,stderr) => {
  var std = stdout.split(/\n/);
  var diskVal = [];
  var keys = [];
  for(var i in std) {
    if(i == 0) {
      keys = std[i].split(/,/);
    } else {
      if(std[i] == '') {} else {
        var value = std[i].split(/,/);
        var innerVal = {};
        for(var j in keys) {
          innerVal[keys[j]] = value[j];
        }
        diskVal.push(innerVal);
      }
    }
  }
});
//exec("df -Ph | awk '/^\// { print "{\"filesystem\":\"$1"\", \"size\":\""$2"\", \"used\":\""$3"\", \"avail\":\""$4"\", \"used\":\""$5"\", \"mounted\":\""$6"\"}" }\'', (err, stdout, stderr) => {
//  console.log(stdout);
    //  var topics = stdout.split("\n");
//});
//var roscore = spawn('df',["-Ph","/media/intel/SSD10"],{ detached: true, stdio: 'inherit' });
//roscore.on('error', function(err) {
//  console.log('Failed to start child process.');
//});
//
//
//`df -Ph /media/intel/SSD10`
