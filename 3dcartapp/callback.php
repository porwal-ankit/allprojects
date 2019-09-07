<?php 
	require 'connection.php';
	
	$storeInfo = file_get_contents('php://input');
	mail('ankit@geeksperhour.com','callback',print_r($storeInfo,true));

	$storeInfo = json_decode($storeInfo);

	$privateKey = '39a0a8a61784d7ecc7e6003b0ed800cf';// Private key is obtained when registering your app at http://devportal.3dcart.com
	$tokenKey  = $storeInfo->TokenKey;
	$secureUrl = $storeInfo->SecureURL;
	$TimeStamp = $storeInfo->TimeStamp;

	
	$query = "INSERT INTO `3dcart_app_data` ( `token_key`, `secure_url`, `time_stamp`) VALUES ('".$tokenKey."','".$secureUrl."','".$TimeStamp."')";

	$result = mysqli_query($conn,$query);
	

	



?>
