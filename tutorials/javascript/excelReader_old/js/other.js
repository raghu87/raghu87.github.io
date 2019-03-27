if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq._cma = function() {
  this.init();
}

vidteq._cma.prototype.init = function () {
  this.attachEvent();
}

vidteq._cma.prototype.attachEvent = function(){
  var that = this;
  $('#bulkInfo').change(function(e) {    
    if($(this).val() == 'others') {
      that.otherAcActivity();    
    }
  });
}

vidteq._cma.prototype.otherAcActivity = function(){  
  var data = {    
    id:"otherAcActivity"
    ,legendName:"Account Activity"    
  };
  $('body').append($('#createAccountTmpl').tmpl(data)[0].outerHTML);  
  var options = {
    selectWhat:'otherActivity'
  };
  $("#otherAcActivity table").append($('#excelReaderTmpl').tmpl(options));
  $('#callBackContainerDiv').html($('#callBackContTmpl').tmpl(options));
  xlReader.init();  
}