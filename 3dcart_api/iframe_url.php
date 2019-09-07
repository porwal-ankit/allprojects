<?php 
if($_GET['customer_note'] ){
	// The short url to expand
	// $url = 'https://goo.gl/maps/fGJEb39Hxd62';
	// $url = 'https://maps.app.goo.gl/5D6Ai';


	$shorturl = $_GET['customer_note'];
	// $shorturl = 'https://goo.gl/maps/UHMVfMW1Sdt';
	if(strpos($shorturl, '?q=') !== false){
		$query_param = explode('?q=', $shorturl);
					
		$params = $query_param[1];

		$new_param = explode(',', $params);
		$lat = $new_param[0];
		// echo json_encode($new_param[1]);
		$array = explode(' ', $new_param[1], 2);

		// $dfg = explode( "\n", $new_param[1]);
		$long = (float) filter_var( $array[0], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION ) ;

		$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
		// $latLongArray = array("lattitude"=>556, "longitude"=>635);
		echo json_encode($latLongArray);

	}elseif (strpos($shorturl, '@') !== false) {
		$query_param = explode('@', $shorturl);
		$params = $query_param[1];
	 	$geo_params = explode(',',$params);
		$lat = $geo_params[0];
		$long = $geo_params[1];
		$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
		echo json_encode($latLongArray);
	}else{
		preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $shorturl, $match);
		// preg_match_all('@((https?://)?(/([-\\w/_\\.]*(\\?\\S+)?)?)*)@',$shorturl,$match);
		$url[0][0] = $match;
		$shorturl = $match[0][0];
// echo $shorturl;die();
		// $shorturl="https://maps.app.goo.gl/UPpi3";
		$shorturl  = str_replace(' ', '', $shorturl ); // remove spaces
		$shorturl = str_replace("\t", '', $shorturl ); // remove tabs
		$shorturl = str_replace("\n", '', $shorturl ); // remove new lines
		$shorturl = str_replace("\r", '', $shorturl ); // remove carriage returns
		mail('ankit@geeksperhour.com', 'customer_note', print_r($shorturl,true));
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $shorturl);
		curl_setopt($ch, CURLOPT_HEADER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$a = curl_exec($ch); // $a will contain all headers
		$e = curl_error($ch);

		 $url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL); // This is what you need, it will return you the last 
		 curl_close($ch);

		 mail('ankit@geeksperhour.com', 'url', print_r($url,true));
				if (strpos($url, '@') !== false) {
				   
					$query_param = explode('@', $url);
					$params = $query_param[1];
				 	$geo_params = explode(',',$params);
					$lat = $geo_params[0];
					$long = $geo_params[1];
					$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
					echo json_encode($latLongArray);

				}elseif(strpos($url, 'ftid') !== false){ 
					$query_param = explode('?q=', $url);
					
					$params = $query_param[1];

					$new_param = explode('&', $params);

					$address = $new_param[0];

					$respArray = getLatLongbyAdress($address);
					// print_r($respArray);
					$lat = $respArray->results[0]->geometry->location->lat;
					$long = $respArray->results[0]->geometry->location->lng;
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
					// $latLongArray = array("lattitude"=>556, "longitude"=>635);
					echo json_encode($latLongArray);

				}elseif(strpos($url, '!3d') !== false){
			
					// $geoString 		=  getBetween($url,'!3d','!4d');
					// $geoArray  		= explode(',', $geoString);
					$lat 			= getBetween($url,'!3d','!4d');
					$long 			= getBetween($url,'!4d','?hl');
					$latLongArray 	= array("lattitude"=>$lat, "longitude"=>$long);
					echo json_encode($latLongArray);

				}
				// else{
				// 	$query_param = explode('?q=', $url);
				// 	echo $url;
				// 	$params = $query_param[1];

				// 	$new_param = explode(',', $params);
				// 	$lat = $new_param[0];
				// 	// echo json_encode($new_param[1]);
				// 	$array = explode(' ', $new_param[1], 2);

				// 	// $dfg = explode( "\n", $new_param[1]);
				// 	$long = (float) filter_var( $array[0], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION ) ;

				// 	$latLongArray = array("lattitude"=>$lat, "longitude"=>$long);
				// 	// $latLongArray = array("lattitude"=>556, "longitude"=>635);
				// 	echo json_encode($latLongArray);
				// }
	}
}


function getBetween($string, $start = "", $end = ""){
    if (strpos($string, $start)) { // required if $start not exist in $string
        $startCharCount = strpos($string, $start) + strlen($start);
        $firstSubStr = substr($string, $startCharCount, strlen($string));
        $endCharCount = strpos($firstSubStr, $end);
        if ($endCharCount == 0) {
            $endCharCount = strlen($firstSubStr);
        }
        return substr($firstSubStr, 0, $endCharCount);
    } else {
        return '';
    }
}

function getLatLongbyAdress($addr){
	$curl = curl_init();
//   AIzaSyBuvFM-a8B2boysd7i6-mkz0F_AkdneOPQ  AIzaSyDUbE6UAFDiBDzO6IE-qepj3PCSUFGda_c
	curl_setopt_array($curl, array(
	  CURLOPT_URL => "https://maps.googleapis.com/maps/api/geocode/json?address=$addr&key=AIzaSyBuvFM-a8B2boysd7i6-mkz0F_AkdneOPQ",
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_ENCODING => "",
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 30,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => "GET",
	));

	$response = curl_exec($curl);
	$err = curl_error($curl);

	curl_close($curl);

	if ($err) {
	  echo "cURL Error #:" . $err;
	} else {
	  return json_decode($response);
	}
}
?>