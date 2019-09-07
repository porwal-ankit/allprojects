<?php
    $conn = mysqli_connect("localhost","fashionfitr_lightspeed" ,"G2P1FpmRB","fashionfitr_lightspeed");

    if (mysqli_connect_errno())
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }

define('APP_KEY', '9edb507b4fca258de9b63e11b61c1a53');
define('APP_SECRET', 'a1540df69543485cfbd9f367d257d0a9');

function curl_data($url){

		$curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => $url,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => "",
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 30,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => "GET",
		  CURLOPT_HTTPHEADER => array(
		    "authorization: Basic OWVkYjUwN2I0ZmNhMjU4ZGU5YjYzZTExYjYxYzFhNTM6N2RjYmFjNmEwYTg1ZTAxNzhhNjgzYTNmNDA0ZGY0NjM=",
		    "cache-control: no-cache",
		    "postman-token: 475bf972-0d38-c939-9393-ba3d9e0bcab3"
		  ),
		));

		$response = curl_exec($curl);
		$err = curl_error($curl);

		curl_close($curl);

		if ($err) {
		  echo "cURL Error #:" . $err;
		} else {
		  return $response;
		}
 }

?>