<?php 
	include 'config.php';
if (isset($_POST) && $_POST !='') {

	$shopid 		= $_POST['shopid'];
	$LSshopid 		= $_POST['ls_shopid'];
	// $module 		= $_POST['module'];
	$gender 		= $_POST['gender'];
	// $brand  		= $_POST['brand'];
	$label  		= $_POST['label'];
	$language 		= $_POST['language'];
	$addToCart 		= $_POST['addToCart'];
	// $prodname 		= $_POST['prodname'];
	// $measurement 	= $_POST['measurement'];

	$query = "SELECT ls_shopid FROM `api_parameters` WHERE ls_shopid =".$LSshopid;

	$result=mysqli_query($conn, $query);

	$number = mysqli_num_rows($result);

     if($number > 0){
     	// echo "gsdg";die();
     	$query= "UPDATE api_parameters set ls_shopid='".mysqli_real_escape_string($conn,$LSshopid) ."', shopid ='".mysqli_real_escape_string($conn,$shopid)."', gender ='".mysqli_real_escape_string($conn,$gender)."', label= '".mysqli_real_escape_string($conn,$label)."', language= '".mysqli_real_escape_string($conn,$language)."', addToCart = '".mysqli_real_escape_string($conn,$addToCart)."' WHERE ls_shopid =".$LSshopid; 
     	$result = mysqli_query($conn, $query);
     }else{
			$query = "INSERT INTO `api_parameters`(`ls_shopid`,`shopid`, `gender`, `label`, `language`, `addToCart`) VALUES ('".mysqli_real_escape_string($conn,$LSshopid)."','".mysqli_real_escape_string($conn,$shopid)."','".mysqli_real_escape_string($conn,$gender)."','".mysqli_real_escape_string($conn,$label)."','".mysqli_real_escape_string($conn,$language)."','".mysqli_real_escape_string($conn,$addToCart)."')";

	$result = mysqli_query($conn,$query);

}
	if($result){
		echo "SUCCESS";
		exit();
	}else{
		echo "failed";
	}
	
}
	

	