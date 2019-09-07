<?php
require "vendor/autoload.php";
// Configure
// --------------------------------------------------
define('APP_KEY', '9edb507b4fca258de9b63e11b61c1a53');
define('APP_SECRET', 'a1540df69543485cfbd9f367d257d0a9');


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
        // Store the store identifier (ID), API token and store language for later use
        // Each API token represents a single store
//        mysql_query("
//         INSERT INTO shops (
//          shop_id,
//          token,
//          language,
//          clusterId
//         ) VALUES (
//          '".mysql_real_escape_string($_GET['shop_id'])."',
//          '".mysql_real_escape_string($_GET['token'])."',
//          '".mysql_real_escape_string($_GET['language'])."',
//          '".mysql_real_escape_string($_GET['cluster_id'])."'
//       )");

        // Redirect the user to your app
        // header('Location: http://www.yourdomain.com/');
        // exit;
    }
}

        // Connect to the Webshopapp API using the cluster, stored API token and store language
        $cluster = 'eu1'; // Where cluster can be one of `eu1`, `us1`
        $api = new WebshopappApiClient($cluster, APP_KEY, '7dcbac6a0a85e0178a683a3f404df463', 'nl');

        $shopInfo = $api->shop->get();

        // echo '<pre>';
        // print_r($shopInfo);
        // echo '</pre>';

        $shopScript = $api->shopScript->create([
                "url" => "https://lightspeed.fashionfitr.com/js/embed.js", 
                "location" => "body" 
            ]);

        echo '<pre>';
        print_r($shopScript);
        echo '</pre>';


?>