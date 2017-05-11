https://www.npmjs.com/package/curlrequest

var curl = require('curlrequest');
var options = {
    url: 'google.com'
  , verbose: true
  , stderr: true
};
 
curl.request(options, function (err, data) {
  if(err) {
    console.log(err);
  }
  console.log(data);
});
