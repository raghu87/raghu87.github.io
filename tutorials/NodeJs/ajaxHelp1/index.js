var request = require('ajax-request');
  base64Image = "";
  
  var CBRParam = {
    action: "testAjaxRequest"
    ,image: base64Image
    ,name: imageName
    ,orgname: "mmi"
    ,q: q
  }
  console.log("CBRParam:",CBRParam);
  var testURL = "http://10.4.71.100/local/rohit/maze/vs/trackSticker.php"
  request.post({
    url: testURL //portURL
    ,data: CBRParam
    //,headers: {}
  },function(err,res) {
    if(err) {
      console.log("error in CBR Request",err);
    }
    if(res) {
     console.log("CBR result",res);
    }
  });

