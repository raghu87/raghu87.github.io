#!/usr/bin/env node
var disk = require('diskusage');

// get disk usage. Takes mount point as first parameter
disk.check('/media/intel/SSD10', function(err, info) {
    console.log(info);
    console.log(info.free);    
    console.log(info.total);
});
