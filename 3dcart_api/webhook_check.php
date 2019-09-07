<?php 
	require 'connection.php';

	if(isset($_POST) && $_POST['token'] !=''){

		$tokenKey = $_POST['token'];

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
		    
		   
		    $httpHeader = array(
		        'Content-Type: application/json;charset=UTF-8',
		        'Accept: application/json',
		        'SecureUrl: ' . $secureUrl,
		        'PrivateKey: ' . $privateKey,
		        'Token: '.$tokenKey,
		    );

		    $ch =  curl_init($host . '/3dCartWebAPI/v' . $version . '/' . $service);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST,'GET');
            curl_setopt($ch, CURLOPT_USERAGENT, $agent);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $response = curl_exec($ch);
            
            if ($response === false) {
              $response = curl_error($ch);
            }

            curl_close($ch);

            $response = json_decode($response,true);
            // echo "<pre>";
            // print_r($response);

            foreach ($response as $webhook) {
              if($webhook['Name'] == "New Order" && $webhook['EventType'] == "1"){
                echo "<div class='alert alert-success'>Webhook for New order created successfully!!</div>";
              }else{
                echo "<div class='alert alert-danger'>Something went wrong!!</div>";
              }
            }
		}//end num_rows
	}//end isset post

?>