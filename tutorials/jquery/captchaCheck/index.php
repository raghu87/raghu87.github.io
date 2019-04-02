<?php

if(!isset($_REQUEST) || (isset($_REQUEST) && empty($_REQUEST))) {
  echo "Welcome";
  exit;
}

//echo print_r($_REQUEST,true);
$videoFileName = "";
$videoPath = "";
if(isset($_REQUEST['path']) && !empty($_REQUEST['path'])) {
  $videoPath = $_REQUEST['path'];
}
if(isset($_REQUEST['vid']) && !empty($_REQUEST['vid'])) {
  $videoFileName = $_REQUEST['vid'];
}
$videoLink = $videoPath."/".$videoFileName;

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title></title>
    <link rel="stylesheet" type="text/css" href="css/jquery.realperson.css">
    <style type="text/css">
      html, body {
        width:100%;
        height:100%;
        margin:auto;      
        background: #fafafa;
      }

      .overlayCurtain {
        position: fixed;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        display: none;  
      }

      .overlayCurtain a {
        position: absolute;
        top: 0px;
        left: 0px;
        margin: auto;
        right: 0px;
        bottom: 0px;
        width: 140px;
        height: 14px;
        line-height: 14px;
        color: white;
        font-size: 20px;
      }
      
      .right {
        float: right;
      }
      .left {
        float: left;
      }
      .clear {
        clear: both;
      }
      .clearspace {
        clear: both;
        height: 1px;
        line-height: 1px;
      }
      .office-center {
        float: left;
        width: 306px;
        padding: 0px 14px;
      }
      .your-contact-center {
        float: right;
        margin-bottom: 20px;
      }
      .your-contact-left {
        float: left;
        text-align: left !important;
        width: 126px;
        padding-top: 5px;
        font-size: 12px;
        color: #000;
      }
      .your-contact-right {
        float: right;
        background-color: #373737;
        width: 168px;
        height: 28px;
        padding: 2px 0px 0px 5px;
        border: 1px solid #5a5959;
        text-align: left;
      }
      .input-text {
        font-size: 12px;
        color: #cdcdcd;
        font-weight: normal;
        text-align: left;
        width: 164px;
        height: 22px;
        background-color: #373737;
        border: none;
        padding: 0;
      }
      
      .heading1 {
        color: #000;
        width: 302px;
        font-size: 18px;
        font-weight: normal;
        margin-top: 10px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #A87C2C;
      }
      .mandatory {
        font-size: 11px;
        color: #000;
        text-align: center;
      }
      .submitBtn {
        margin: 5px 0px 5px 100px !important;
        background-color: #91671b;
        border: 1px solid #b59754;
        padding: 3px 5px 3px 5px !important;
        float: left;
        cursor:pointer;
        width:110px !important;
        text-align:center;
        color: #fff;
      }
  
    </style>
  </head>
  <body>  
    <div id="captchaTb" class='vidteq-wrapper-sideBarUI' style="height:396px;">  
      <div  class="office-center infoContent" >
        <div>
          <div class="heading1">Fill Your Contact Details</div>
          <div style="margin-top:6px; float:left;" class="your-contact-center">
            <div class="your-contact-left"><a class='simple' vidCol='q_name' id='q1-text' vidMust='condition1:condition1' >Name</a></div>
            <div class="your-contact-right">
              <input type="text" onkeyup="this.value = this.value.replace(/[^a-zA-Z -.]/g,'');" style="margin-bottom:7px;" class=" input-text" id='q1-ans' name="name">
              <label style="color:#866220; font-size:13px; font-family:'AvantGarde Bk BT'; float:left; margin-left:-4px; margin-bottom:00px;" class="error" generated="true" for="name" id="error-q1-ans"></label>
            </div>
          </div>
          <div style="float:left" class="your-contact-center">
            <div class="your-contact-left"><a class='simple' vidCol='q_email' id='q2-text' vidMust='condition2:condition2' >Email Address&nbsp&nbsp&nbsp</a></div>
            <div class="your-contact-right">
              <input type="text" style="margin-bottom:7px;" class=" input-text" id='q2-ans' name="email" vidCheck='checkEmailId'>
              <label style="color:#866220; font-size:13px; font-family:'AvantGarde Bk BT'; float:left; margin-left:-4px; margin-bottom:00px;" class="error" generated="true" for="email" id="error-q2-ans"></label>
            </div>
          </div>
          <div style="float:left" class="your-contact-center">
            <div class="your-contact-left"><a class='simple' vidCol='q_mobile' id='q3-text' vidMust='condition3:condition3' >Phone Number&nbsp&nbsp&nbsp</a></div>
            <div class="your-contact-right">
              <input type="text" maxlength="15" onkeyup='this.value = this.value.replace (/[^0-9]/g,"");vidteq.utils.keyCountTimer("q3-ans","q3-counter");' style="margin-bottom:7px;" class=" input-text" id='q3-ans' name="contact" vidCheck='checkPhoneNumber'>
              <label style="color:#866220; font-size:13px; font-family:'AvantGarde Bk BT'; float:left; margin-left:-4px; margin-bottom:00px;" class="error" generated="true" for="contact" id="error-q3-ans"></label>
            </div>
          </div>
          <div style="float:left" class="your-contact-center">
            <div class="your-contact-left"><a class='simple' vidCol='q_customer_city' id='q4-text'> Your City </a></div>
            <div class="your-contact-right">
              <input id='q4-ans' type='text' value='' maxlength=15 class=" input-text" style='margin-bottom:7px;'/>
              <label style="color:#866220; font-size:13px; font-family:'AvantGarde Bk BT'; float:left; margin-left:-4px; margin-bottom:00px;" class="error" generated="true" for="enquiry_city" id="error-q4-ans"></label>
            </div>
          </div>

          <div class="your-contact-center" style="float:left;position: relative;width: 100%;" id='captchaDiv'> 
            <input type="text" id="defaultReal" name="defaultReal" class="input-captcha" size="40" placeholder="Captcha">
            <label id="errordefaultReal" generated="true" class="error" style="left:0px;position: relative;bottom: 0px;color:#866220; font-size:13px; font-family:'AvantGarde Bk BT'; float:left;">  </label>
          </div>



          <a class='simple' id='q3-counter' style='position:absolute;left:30px;bottom:30px;'></a> 
          <div style="text-align:center;"><input width="50px;" type="button" value="SUBMIT" class="submitBtn" id="detailsSubmit" name="submit_enquiry" title='Submit User Info'></div>
          <br class="clear">
          <div class="mandatory"> All fields are mandatory </div>
        </div>
      </div> 
    </div>
    
          
    <div id="loadingCurtain" class="overlayCurtain"><a>Please Wait ...</a></div>
    <a href="directAccess.php?file=../GazeMaze/<?php echo $videoLink; ?>" id="clickVideo"></a>
    <script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.realperson.js"></script>
    <script type="text/javascript">      
      $(document).ready(function () {
        if(typeof($.fn.realperson) == 'function') {
          $('#defaultReal').realperson();
        }

        $('#detailsSubmit').click(function () {
          var data = {
            defaultReal:$('#defaultReal').val(),
            defaultRealHash:$('input[name=defaultRealHash]').val()
          };  
          console.log(rpHash(data.defaultReal));
          console.log(data.defaultRealHash);
          var name = $('#q1-ans').val();
          var email = $('#q2-ans').val();
          var phone = $('#q3-ans').val();
          var city = $('#q4-ans').val();
          if(name == '') {
            $('#error-q1-ans').html('Please Enter Name');
          } else {
            $('#error-q1-ans').html('');
          }
          if(email == '') {
            $('#error-q2-ans').html('Please Enter Email');
          } else {
            $('#error-q2-ans').html('');
          }
          if(phone == '') {
            $('#error-q3-ans').html('Please Enter Phone No');
          } else {
            $('#error-q3-ans').html('');
          }
          if(city == '') {
            $('#error-q4-ans').html('Please Enter City');
          } else {
            $('#error-q4-ans').html('');
          }
          if (name != '' && email != '' && phone != '' && city != '' && rpHash(data.defaultReal) == data.defaultRealHash) {
            $('#captchaTb').hide();
            $('#loadingCurtain').show();
            sendMail();                          
          } else {
            $(".realperson-text").trigger("click");
            $('#errordefaultReal').html('Please Enter Proper Captcha')
          }
        });
      });

      function sendMail() {
        var url = "http://www.vidteq.com/vs/classes/emailPost.php";
        var name = $('#q1-ans').val();
        var email = $('#q2-ans').val();
        var phone = $('#q3-ans').val();
        var city = $('#q4-ans').val();
        var body = "";
        body+="<table>";
        body+="<tr><td colspan='2'>Downloaded Video Link is : <?php echo $videoLink; ?></td></tr>";
        body+="<tr><td>Name: </td><td>"+name+"</td></tr>";
        body+="<tr><td>Email: </td><td>"+email+"</td></tr>";
        body+="<tr><td>Phone No: </td><td>"+phone+"</td></tr>";
        body+="<tr><td>City: </td><td>"+city+"</td></tr>";
        body+="</table>";
        var toEmail = "navada@vidteq.com";
        var data = {
          action:'sendEmail'
          ,to:toEmail
          ,subject:'Downloaded Video Link is : <?php echo $videoLink; ?>'
          ,body:body
        };
        $.ajax({
          url:url
          ,data:data
          ,dataType: "jsonp"
          ,type:'POST'
          ,success:function (response) {
            console.log('success',response);
            $('#clickVideo')[0].click();
            setTimeout(function () {
              $('#loadingCurtain').hide();              
              document.location = "../GazeMaze/<?php echo $videoPath; ?>";
            },1000);
            
          } 
          ,error:function (response) {
            console.log('error',response);
          }
        });
      }

      function rpHash (value) {
        var hash = 5381;
        for (var i = 0; i < value.length; i++) {
          hash = ((hash << 5) + hash) + value.charCodeAt(i);
        }
        return hash; 
      }
    </script>
  </body>
</html>