console.log("inside nodetest ",new Date(),Date.now());
var fs = require('fs');
fs.writeFile("/home/raghu87/Desktop/servicetest/test"+Date.now(), "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 
