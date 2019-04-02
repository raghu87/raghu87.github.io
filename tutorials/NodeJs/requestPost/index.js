const request = require('request');
//request('http://10.4.71.100/local/rohit/maze/vs/trackSticker.php?action=testAjaxRequest', function (error, response, body) {
//  console.log('error:', error); // Print the error if one occurred
//  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//  console.log('body:', body); // Print the HTML for the Google homepage.
//});

request.post({url:'http://10.4.71.100/local/rohit/maze/vs/trackSticker.php',formData:{action:'testAjaxRequest',city:'bangalore'}}, function (error, response, body) {
  console.log(body);
});
