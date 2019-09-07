<?php 
// print_r($_POST);die();
	require 'connection.php';
	if(isset($_POST) && $_POST['clientId'] !='' && $_POST['clientSecret'] !='' && $_POST['token'] !='' ){

		$client_id 		= $_POST['clientId'];
		$client_secret 	= $_POST['clientSecret'];
		$token 			= $_POST['token'];

		$query = "UPDATE `3dcart_app_data` SET client_id = '".$client_id."' ,client_secret = '".$client_secret."' WHERE token_key = '".$token."'";
	
		$result = mysqli_query($conn,$query);
		// print_r($result);
		// $result = 1;
		if($result){
			echo "<div class='alert alert-success'>Your information saved successfully!!</div>";	
		}
		
	}else{
		echo "<div class='alert alert-danger'>Please fill the Client ID and  Client Secret</div>";
	}

?>