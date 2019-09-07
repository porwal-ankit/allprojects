<?php
// mail('ankit@geeksperhour.com', 'get var', print_r($_GET,true));
$host = 'https://apirest.3dcart.com';
$version = 1;
$service = 'FrontendScripts';
$secureUrl = 'sandbox-ecommercefoundation-org.3dcartstores.com';   // Secure URL is set in Settings->General->StoreSettings
// $privateKey = '2bd182b40aa9e7c566b9401e96f0eab7'; // Private key is obtained when registering your app at http://devportal.3dcart.com
$privateKey = '39a0a8a61784d7ecc7e6003b0ed800cf'; // Private key is obtained when registering your app at http://devportal.3dcart.com
// $token = '	e6ad710fd1bec47b0a242af82d4022d5';      // The token is generated when a customer authorizes your app
$token = '0b2d063c23529a965d28f002aec920c1';      // The token is generated when a customer authorizes your app
// initialize cURL session
// $ch = curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service);
// set headers
$httpHeader = array(
		'Content-Type: application/json;charset=UTF-8',
		'Accept: application/json',
		'SecureUrl: ' . $secureUrl,
		'PrivateKey: ' . $privateKey,
		'Token: ' . $token,
);

 $frontendjsonData = '{
      "FrontendScriptID": 1,
      "Placement": "HEAD",
      "Code": "<script src=\'https://merchant.safe.shop/widget.js\'></script>",
      "DateCreated": "03/01/2019 12:39",
      "LastUpdate": "03/01/2019 12:39"
    }';  

     $ch =  curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service.'/6');
     // $ch =  curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'DELETE');
            // curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'GET');
            // curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'POST');
            // curl_setopt($ch, CURLOPT_POSTFIELDS, $frontendjsonData);
            curl_setopt($ch, CURLOPT_USERAGENT, $agent);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $response = curl_exec($ch);
            
            if ($response === false) {
              $response = curl_error($ch);
            }
            echo "<pre>";
print_r(curl_getinfo($ch));
            curl_close($ch);

            $response = json_decode($response,true);
print_r($response);
?>
