<?php
require "vendor/autoload.php";
include 'config.php';

// On install
// --------------------------------------------------
if (isset($_GET['language'])
    && isset($_GET['shop_id'])
    && isset($_GET['signature'])
    && isset($_GET['timestamp'])
    && isset($_GET['token']))
{
    // Create the signature
    $params = [
        'language'  => $_GET['language'],
        'shop_id'   => $_GET['shop_id'],
        'timestamp' => $_GET['timestamp'],
        'token'     => $_GET['token'] // in between token
    ];

    ksort($params);

    $signature = '';

    foreach ($params as $key => $value)
    {
        $signature .= $key.'='.$value;
    }

     $signature = md5($signature.APP_SECRET);
   
    // Validate the signature
    if ($signature == $_GET['signature'])
    {
        $selQuery = "SELECT `shop_id` FROM shops WHERE shop_id =".$_GET['shop_id'];
        $selResult = mysqli_query($conn,$selQuery);
        $numRows = mysqli_num_rows($selResult);

        if($numRows >0){
            $token = $_GET['token'];
            $language = $_GET['language'];
            $clusterId = $_GET['cluster_id'];
            $shopId = $_GET['shop_id'];

            $upQuery = "UPDATE shops SET token='".mysqli_real_escape_string($conn,$token) ."',language='".mysqli_real_escape_string($conn,$language)."',clusterId='".mysqli_real_escape_string($conn,$clusterId)."' WHERE shop_id =".$shopId;

            $result = mysqli_query($conn, $upQuery);
        }else{
            // Store the store identifier (ID), API token and store language for later use
            // Each API token represents a single store
           $result = mysqli_query($conn, "
            INSERT INTO shops (
             shop_id,
             token,
             language,
             clusterId
            ) VALUES (
             '".mysqli_real_escape_string($conn, $_GET['shop_id'])."',
             '".mysqli_real_escape_string($conn, $_GET['token'])."',
             '".mysqli_real_escape_string($conn, $_GET['language'])."',
             '".mysqli_real_escape_string($conn, $_GET['cluster_id'])."'
          )");
        }
        if($result){
            // Redirect the user to your app
            header("Location: http://lightspeed.fashionfitr.com/index.php?shopid=".$_GET['shop_id']);
            exit;   
        }else{
            echo "There is some error in installing the app";
        }
        
    }
}
?>  