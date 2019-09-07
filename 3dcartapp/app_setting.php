<?php 

  require 'connection.php';

  $tokenString = $_SERVER['QUERY_STRING'];

  $tokenArray = explode('=', $tokenString);

  $tokenKey = $tokenArray[1];
  mail('ankit@geeksperhour.com', 'token',print_r($tokenKey,true));
  $query = "SELECT * FROM `3dcart_app_data` WHERE token_key='".$tokenKey."'limit 1";

  $result = mysqli_query($conn,$query);

  $numRow = mysqli_num_rows($result);

  if($numRow){
    $row = mysqli_fetch_assoc($result);

    $clientId     = $row['client_id']; 
    $clientSecret = $row['client_secret']; 
  
    $host = 'https://apirest.3dcart.com';
    $version = 1;
    $service = 'Webhooks';
    $secureUrl = $row['secure_url'];   // Secure URL is set in Settings->General->StoreSettings
    $privateKey = '39a0a8a61784d7ecc7e6003b0ed800cf';// Private key is obtained when registering your app at http://devportal.3dcart.com
    
    // initialize cURL session
    $ch = curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service);
    // set headers
    $httpHeader = array(
        'Content-Type: application/json;charset=UTF-8',
        'Accept: application/json',
        'SecureUrl: ' . $secureUrl,
        'PrivateKey: ' . $privateKey,
        'Token: '.$tokenKey,
    );
    $webhookUrl = "https://elearningmitra.com/3dcartapp/webhook.php?t=".$tokenKey;
    
    $jsonData = '{
      "Name": "New Order",
      "Url":"'.$webhookUrl.'",
      "EventType": 1,
      "Format": "JSON",
      "Enabled": true
    }'; 
    //mail('ankit@geeksperhour.com', 'json data', $jsonData);
    // echo $jsonData;die();
    curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    $agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';
      curl_setopt($ch, CURLOPT_USERAGENT, $agent);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $response = curl_exec($ch);
    if ($response === false) {
      $response = curl_error($ch);
    }
    mail('ankit@geeksperhour.com', 'webappsetting',print_r(curl_getinfo($ch),true));
    
    curl_close($ch);
    $response = json_decode($response);


 $service = 'FrontendScripts';
    $frontendjsonData = '{
      "FrontendScriptID": 1,
      "Placement": "HEAD",
      "Code": "<script src=\'https://merchant.safe.shop/widget.js\'></script>",
       "DateCreated": "03/01/2019 12:39",
      "LastUpdate": "03/01/2019 12:39"
    }'; 
 

     $ch =  curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'POST');
            curl_setopt($ch, CURLOPT_POSTFIELDS, $frontendjsonData);
            curl_setopt($ch, CURLOPT_USERAGENT, $agent);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $response = curl_exec($ch);
            
            if ($response === false) {
              $response = curl_error($ch);
            }
mail('ankit@geeksperhour.com', 'frontscriptsetting',print_r(curl_getinfo($ch),true));
            curl_close($ch);

            $response = json_decode($response,true);
           // print_r($response);
mail('ankit@geeksperhour.com', 'frontscript response',print_r($response,true));

            foreach ($response as $status) {
              if($status['Status'] == "200" || $status['Status'] == "201"){
                echo "<div class='alert alert-success'>Widget installed successfully!!</div>";
              }else{
                echo "<div class='alert alert-danger'>Error in adding widget to the site.</div>";
              }
            }
  }//end numrows


?>

<!DOCTYPE html>
<html lang="en">
<head>
  <title>App Setting</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
<body>

<div class="container">
  <div class="row">
    <div id="webresponseDiv"></div>
    <div class="col-sm-8"><h3>App Setting </h3></div>
    <div class="col-sm-4 text-right">
      <form id="webhookInfo" method="post">
        <input type="hidden" name="token" value="<?php echo $tokenKey;?>">
      <button class="btn btn-success" id="webhook">Test Webhook</button>
      </form>
    </div>
  </div>
  
  <form method="post" id="clientInfo" >
    <div class="form-group">
      <input type="hidden" name="token" value="<?php echo $tokenKey;?>">
      <label for="clientId">Client ID:</label>
      <input type="text" class="form-control" id="clientId" value="<?php if(!empty($clientId)){ echo $clientId;} ?>" placeholder="CLient ID" name="clientId" required="required">
    </div>
    <div class="form-group">
      <label for="clientSecret">Client secret:</label>
      <input type="text" class="form-control" id="clientSecret" value="<?php if(!empty($clientSecret)){ echo $clientSecret;} ?>" placeholder="Client Secret" name="clientSecret" required="required">
    </div>
    
    <button id="submitInfo" class="btn btn-default">Submit</button>

  </form>
  <div id="responseDiv"></div>

  <!-- <div class="alert alert-info">
 <p> <strong>Important Instructions:</strong>
  Please follow this simple steps to add safe shop widget into your store</p>
  <ol>
    <li>GOTO 3dcart admin <b>Dashboard->Design->Theme&style </b></li>
    <li>Click on <b>More</b> dropdown at right top corner and choose <b>Edit template(HTML)</b></li>
    <li>Now edit the <b>frame.html</b> file</li>
    <li>Now add the below script tag before the closing of head tag(<b>&lt;/head&gt;</b>)</li>
    <li><b>&lt;script src="http://merchant.safe.shop/widget.js"&gt;&lt;/script&gt;</b></li>
    <li>Now add the client ID and client Secret you recieve from safe shop to above fields to activate your account.</li>
    <li>That's it, you are done.</li>
  </ol>
</div> -->

</div>
<script type="text/javascript">
  $(document).ready(function(){
    $('#submitInfo').click(function(){
      var clientInfo = $('#clientInfo').serialize();

      $.ajax({
        type:'post',
        url:'https://elearningmitra.com/3dcartapp/ajax.php',
        data:$('#clientInfo').serialize(),
        success:function(respData) {
          $('#responseDiv').html(respData);
          $('#responseDiv').show();
        }
      });

    });
    $('#webhook').click(function(){
      
      $.ajax({
        type:'post',
        url:'https://elearningmitra.com/3dcartapp/webhook_check.php',
        data:$('#webhookInfo').serialize(),
        success:function(respData) {
          $('#webresponseDiv').html(respData);
        }
      });
    });
  });
</script>
</body>
</html>
