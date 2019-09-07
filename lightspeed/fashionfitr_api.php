<?php 
	header('Access-Control-Allow-Origin: *');
	include 'config.php';

	$shopid = $_POST['shopid'];

	$result = mysqli_query($conn, "SELECT * FROM api_parameters WHERE ls_shopid =".$shopid);

      $shop = mysqli_fetch_assoc($result);

    echo json_encode($shop);
?>