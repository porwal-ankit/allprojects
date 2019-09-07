<?php 
  require "vendor/autoload.php";
  include 'config.php';

    $cluster = 'eu1'; // Where cluster can be one of `eu1`, `us1`
    $api = new WebshopappApiClient($cluster, APP_KEY, '7dcbac6a0a85e0178a683a3f404df463', 'nl');
// $script_id = 3201002;
// $shopscript = $api->shopScripts->delete($script_id);
    $shopscript = $api->shopScripts->get();
    print_r($shopscript);
?>


<!DOCTYPE html>
<html>
<head>
	<title>Fashionfitr</title>
	<script type="text/javascript" src="https://popup.fashionfitr.com/js/ffb-min.js"></script>
	<link href="https://popup.fashionfitr.com/js/fashion-fitr-button.css" rel="stylesheet">
</head>
<body>
<div class="button"></div>
</body>
<script>

            fashionFitrButton.getButton({shopid:9999999,
                    module: 'T-Shirts%20%26%20Polo%26%2339%3Bs',
                    gender: 'w',
                    brand: 'BUGATTI',
                    label: 'label',                 //'label' or 'size', or 'combi' e.g. XXL / 40 / XXL-40
                    language: 'en-EN',
                    container: 'button',
                    name: 'Bugatti%20Polo%2075073',
                    addToCart: false,
                    measurement: 'M',
                    fakebutton:false,               // for testmodus development only
                    callback: function(item){
                      console.log(item);
                    }
               });
         
</script>
</html>