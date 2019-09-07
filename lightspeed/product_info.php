<?php 

	header('Access-Control-Allow-Origin: *');
	include 'config.php';

	$product_id = $_POST['prodid'];
	// $product_id = '76449467';

	require "vendor/autoload.php";

	$cluster = 'eu1'; // Where cluster can be one of `eu1`, `us1`
    $api = new WebshopappApiClient($cluster, APP_KEY, '7dcbac6a0a85e0178a683a3f404df463', 'nl');

    $shopInfo = $api->products->get($product_id);

    $productData = array();

    $productData['productName'] = $shopInfo['title'];

    // print_r($shopInfo);//http://api.webshopapp.com/nl/categories/products.json?product=11102
    foreach ($shopInfo['categories'] as $cat) {
    	
    }
    foreach ($shopInfo['brand'] as $brand) {
    	
    }

    foreach ($shopInfo['set'] as $option) {
    	foreach ($option as $size) {
    		
    	}
    }
    if(isset($size['values'][0]['name']) && $size['values'][0]['name'] != '' ){
    	$productData['measurement'] = $size['values'][0]['name'];
	}

    if(isset($brand['id']) && $brand['id'] != '' ){
    	$brand_id = $brand['id'];
    	$brandData = $api->brands->get($brand_id);
    	$brandName = $brandData['title'];

    	$productData['brandName'] = $brandName;

    }

    if(isset($cat['link']) && $cat['link'] != '' ){
    	$link = $cat['link'];

    	$categoryData = curl_data($link);
    	$catDecode = json_decode($categoryData);
    
	    foreach ($catDecode as $value) {
	    	foreach ($value as $key) {
	    		$categoryId = $key->category->resource->id;
	    	}
	    }
 		if(isset($categoryId) && $categoryId != ''){
 			$category = $api->categories->get($categoryId);
			$productData['categoryName']= $category['fulltitle'];	
 		}
    }
    // print_r($productData);
    echo json_encode($productData);
   
?>