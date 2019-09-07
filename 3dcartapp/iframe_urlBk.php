<?php 
if($_GET['customer_note']){
	// The short url to expand
// $url = 'https://goo.gl/maps/fGJEb39Hxd62';
// $url = 'https://maps.app.goo.gl/5D6Ai';
$url = $_GET['customer_note'];

// $url="http://goo.gl/fbsfS";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$a = curl_exec($ch); // $a will contain all headers

$url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); // This is what you need, it will return you the last effective URL

// echo $url;
		if (strpos($url, '@') !== false) {
		    
			$query_param = explode('@', $url);
			$params = $query_param[1];
		 	$geo_params = explode(',',$params);
			
			echo json_encode($geo_params);

		}elseif(strpos($url, '?q=') !== false){
			$query_param = explode('?q=', $url);
			$params = $query_param[1];

			$new_param = explode('&', $params);

			$geo_params = explode(',', $new_param[0] );

			echo json_encode($geo_params);

		}
	}
?>

//

<?php 
if($_GET['customer_note']){
	// The short url to expand
// $url = 'https://goo.gl/maps/fGJEb39Hxd62';
// $url = 'https://maps.app.goo.gl/5D6Ai';
$url = $_GET['customer_note'];

// $url="http://goo.gl/fbsfS";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$a = curl_exec($ch); // $a will contain all headers

$url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); // This is what you need, it will return you the last effective URL

// echo $url;
		if (strpos($url, '@') !== false) {
		    
			$query_param = explode('@', $url);
			$params = $query_param[1];
		 	$geo_params = explode(',',$params);
			$lat = $geo_params[0];
			$long = $geo_params[1];
			$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
			echo json_encode($latLongArray);

		}elseif(strpos($url, '?q=') !== false){
			$query_param = explode('?q=', $url);
			
			$params = $query_param[1];

			$new_param = explode(',', $params);
			$lat = $new_param[0];
			// echo json_encode($new_param[1]);
			$array = explode(' ', $new_param[1], 2);

			// $dfg = explode( "\n", $new_param[1]);
			$long = (float) filter_var( $array[0], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION ) ;

			$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
			echo json_encode($latLongArray);


			// // $geo_params = explode(',', $new_param[0] );

			// echo json_encode($new_param);

		}
		else{
			$latLongArray = array("lattitude"=>0.00, "longitude"=>0.00);
			echo json_encode($latLongArray);
		}
	}
?>