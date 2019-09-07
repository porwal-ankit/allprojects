<?php 
 require 'connection.php';
$body = file_get_contents('php://input');

mail('ankit@geeksperhour.com','webhook GET',print_r($_GET,true));

$jdataArray = json_decode($body,true);

mail('ankit@geeksperhour.com','webhook json data',print_r($jdataArray,true));

function getAccessToken($clientId,$clientSecret){
	$curl = curl_init();

	$array = array('grant_type'=>'client_credentials','client_id'=>$clientId,'client_secret'=>$clientSecret,'scope'=>'*');

	$jsonData = json_encode($array);

	curl_setopt_array($curl, array(
	  CURLOPT_URL => "https://api.safe.shop/v1/oauth/token",
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => "POST",
	  CURLOPT_POSTFIELDS => $jsonData,
	  CURLOPT_HTTPHEADER => array(
	    "accept: application/json",
	    "cache-control: no-cache",
	    "content-type: application/json" 
	  ),
	));

	mail('ankit@geeksperhour.com', 'curlinfo',print_r(curl_getinfo($curl),true));
	$response = curl_exec($curl);

	$err = curl_error($curl);

	curl_close($curl);

	$result = json_decode($response,true);
	return $result;

}

if(isset($_GET) && $_GET['t']){
	$token = $_GET['t'];

	$query = "SELECT * FROM `3dcart_app_data` WHERE `token_key`='".$token."'";
	$result = mysqli_query($conn, $query);

	$numRow = mysqli_num_rows($result);

	if($numRow){
    	$row = mysqli_fetch_assoc($result);

    	$clientId = $row['client_id'];
    	$clientSecret = $row['client_secret'];



		$AuthArray = getAccessToken($clientId,$clientSecret);

		$authToken = $AuthArray['access_token'];

		// print_r($AuthArray);
		mail('ankit@geeksperhour.com','AuthArray',print_r($AuthArray,true));

		$CustEmail 	= $jdataArray[0]['BillingEmail'];
		// $CustEmail 	= 'gaurav@geeksperhour.com';
		$firstname 	= $jdataArray[0]['BillingFirstName'];
		$lastname 	= $jdataArray[0]['BillingLastName'];
		$phone 		= $jdataArray[0]['BillingPhoneNumber'];
		$gender 	= 'Male';
		$oderId 	= $jdataArray[0]['OrderID'];
		$language 	= 'en';
		$city 		= $jdataArray[0]['BillingCity'];
		$country 	= $jdataArray[0]['BillingCountry'];
		$segment 	= 'male 25-35';
		$channel 	= '3dcart';
		$customerId = $jdataArray[0]['CustomerID'];
		$sendDate = $jdataArray[0]['OrderDate'];


		$insQuery = "INSERT INTO `3dcart_customer_data`(`email`, `clientId`, `firstname`, `lastname`, `phone`, `gender`, `oderId`, `language`, `city`, `country`, `segment`, `channel`, `customerId`, `sendDate`) VALUES('".$CustEmail."','".$clientId."','".$firstname."','".$lastname."','".$phone."','".$gender."','".$oderId."','".$language."','".$city."','".$country."','".$segment."','".$channel."','".$customerId."','".$sendDate."')";

		mysqli_query($conn, $insQuery);

		
		$curl = curl_init();

		$customerArray = array('send_datetime'=>$sendDate,'email'=>$CustEmail,'firstname'=>$firstname,'lastname'=>$lastname,'telephone'=>$phone,'gender'=>$gender,'order_id'=>$oderId,'language'=>$language,'city'=>$city,'country'=>$country,'segment'=>$segment,'channel'=>$channel,'customer_id'=>$customerId);
		
		mail('ankit@geeksperhour.com', 'customerArray',print_r($customerArray,true));
		
		$customerJson = json_encode($customerArray);

		curl_setopt_array($curl, array(
		  CURLOPT_URL => "https://api.safe.shop/v1/invites",
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => "",
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 30,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => "POST",
		  CURLOPT_POSTFIELDS => $customerJson,
		  CURLOPT_HTTPHEADER => array(
		    "authorization: Bearer ".$authToken,
		    "cache-control: no-cache",
		    "content-type: application/json"
		  ),
		));
		
		mail('ankit@geeksperhour.com', 'webhook response',print_r(curl_getinfo($curl),true));
		
		$response = curl_exec($curl);
		$err = curl_error($curl);

		curl_close($curl);

		if ($err) {
		  echo "cURL Error #:" . $err;
		} else {
		  echo $response;
		}
	}
}

 ?>