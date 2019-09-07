<?php
  require "vendor/autoload.php";
  include 'config.php';
    if(isset($_GET['shopid']) && $_GET['shopid'] !=''){
      $shopId = $_GET['shopid'];

      $result = mysqli_query($conn, "SELECT * FROM shops WHERE shop_id = '".$shopId."'");

      $shop = mysqli_fetch_assoc($result);
      
      // Create authentication token
      $userSecret = md5($shop['token'].APP_SECRET);

       // Connect to the Webshopapp API using the cluster, stored API token and store language
      $cluster = $shop['clusterId']; // Where cluster can be one of `eu1`, `us1`
      $api = new WebshopappApiClient($cluster, APP_KEY, $userSecret, $shop['language']);

      $shopInfo = $api->shop->get();
      // print_r($shopInfo);die();
      $shop_id = $shopInfo['id'];

      if($shopId == $shop_id){
          $shopScript1 = $api->shopScripts->create([
              "url" => "https://popup.fashionfitr.com/js/ffb-min.js?".$shopId, 
              "location" => "head",
          ]);

          $shopScript2 = $api->shopScripts->create([
              "url" => "https://lightspeed.fashionfitr.com/js/embed.js", 
              "location" => "body" 
          ]);

          $shopscript = $api->shopScripts->get();
          $result = mysqli_query($conn, "SELECT * FROM shop_scripts WHERE shop_id = '".$shopId."'");
          $numrows =  mysqli_num_rows($result);
          if($numrows < 2){
            foreach ($shopscript as $script) {
                $query = "INSERT INTO shop_scripts (shop_id,script_id) VALUES (
                             '".mysqli_real_escape_string($conn, $shop_id )."',
                             '".mysqli_real_escape_string($conn, $script['id'])."'
                          )";
                $result = mysqli_query($conn, $query);
            }
          }
      }

      $query = "SELECT * FROM `api_parameters` WHERE ls_shopid =".$shopId;

        $result=mysqli_query($conn, $query);

        $data = mysqli_fetch_assoc($result);
        // print_r($data);die();
    $domain = $shopInfo['mainDomain'];

    if(isset($domain) && $domain !=''){

        $url = "http://api.fashionfitr.com/lightspeed/".$domain;

          $curl = curl_init();

          curl_setopt_array($curl, array(
            CURLOPT_URL =>  $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
              "cache-control: no-cache",
              "postman-token: 43827eab-769a-7a1f-89c9-435b74b80253"
            ),
          ));

          $response = curl_exec($curl);
          $err = curl_error($curl);
          $response = json_decode($response);
          curl_close($curl);

          // if ($err) {
          //   echo "cURL Error #:" . $err;
          // } else {
          //   echo $response;
          // }

          $fshopId = $response->shopId;
    }
    
?>
<!DOCTYPE html>
<html>
<head>
  <title>API Configuration</title>
  <link rel="stylesheet" type="text/css" href="http://demo.fashionfitr.com/assets/css/main.css">
  <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
  <script
  src="https://code.jquery.com/jquery-3.3.1.min.js"
  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
  crossorigin="anonymous"></script>
  <script type="text/javascript" src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>
  <style type="text/css">
    .dropdown-menu>li>a {
    display: block;
    padding: 10px 16px;
    clear: both;
    font-weight: 400;
    line-height: 20px;
    color: #82869e;
    white-space: nowrap;
    outline: 0;
}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top" style="background-color: #2F3342; display: block;">
           <h1 id="logo" style="float: left;">
      
  <a href="http://fashionfitr.com/home-nederlands-2" target="_blank" title="fashionfitr">
    
              <img src="img/logo.png" alt="" class="thb-standard-logo" scale="0">
      
      </a>
</h1>
<div class="dropdown" style="float: right;display: inline-block;margin-top: 15px;">
  <button class="dropdown-toggle btn" type="button" data-toggle="dropdown"><?php echo $shopInfo['email'];?>
  <span class="caret"></span></button>
  <ul class="dropdown-menu">
    <li><a target="_blank" href="https://<?php echo $shopInfo['mainDomain']; ?>">Open your Site</a></li>
    <li><a target="_blank" href="https://<?php echo $shopInfo['mainDomain']; ?>/backoffice">Back to SeoShop</a></li>
    <li><a href="http://fashionfitr.com/home-nederlands-2">Logout</a></li>
  </ul>
</div>    
      </nav>
<div class="container" style="margin-top: 120px;">
  <h2 style="text-align: center;">Configureable parameters:</h2>
  <form name="parameterForm" id="parameterForm">
    <div class="row">
      <div class="col">
          <div class="form-group">
            <label for="shopId">ShopID:</label>
            <input type="text" class="form-control" name="shopid" id="shopid" aria-describedby="shopIdHelp" placeholder="Enter ShopID here" value="<?php if(isset($fshopId)){echo $fshopId; } ?>">
            <input type="hidden" name="ls_shopid" value="<?php echo $shopId; ?>">
          </div>
          <div class="form-group">
            <label for="shopId">Gender:</label>
            <input type="text" class="form-control" name="gender" id="gender" placeholder="Enter Gender m/w" value="<?php if(isset($data['gender'])){echo $data['gender']; }else{echo 'm';} ?>">
          </div>
          <div class="form-group">
            <label for="shopId">Labels:</label>
            <input type="text" class="form-control" id="label" name="label" placeholder="Enter labels here" value="<?php if(isset($data['label'])){echo $data['label']; }else{echo 'label';} ?>">
          </div> 
          <a id="submit" class="btn btn-primary" style="margin-top: 9px; cursor: pointer;color:#fff;">Submit</a>    
      </div>
      <div class="col">
          <div class="form-group">
            <label for="shopId">Language:</label>
            <input type="text" class="form-control" id="language" name="language" placeholder="Enter language here" value="<?php if(isset($data['language'])){echo $data['language']; }else{echo 'en-EN';} ?>">
          </div>
          <div class="form-group">
            <label for="shopId">Add to cart:</label>
            <select class="form-control" id="addToCart" name="addToCart">
              <option value="true">True (AddToCart button)</option>
              <option value="false">False (Close button)</option>
            </select>
          </div>
          
          
     </div>
    </div>
    <div id="mRespDiv"></div>
  </form>
</div>
<script type="text/javascript">
  $(document).ready(function(){
    $("#submit").click(function(){
        $.ajax({
        type:'post',
        url:'api_ajax.php',
        data:$('#parameterForm').serialize(),
        success:function(respData){
          if(respData=="SUCCESS")
          {
            $('#mRespDiv').html('<div class="alert alert-success">Details Successfully Saved!</div>'); 
          }
          else
          {
            $('#mRespDiv').html('<div class="alert alert-danger">Something went wrong!</div>');
          }
        }
      });
    });
  });
</script>
<?php }else{ ?>
<h3>You are not authorized to access this page.</h3>
<?php } ?>
</body>
</html>