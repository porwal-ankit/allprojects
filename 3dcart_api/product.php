<?php
namespace RestDoc\HttpClient;
class RestClient 
{
	
	private $url;
	private $secureUrl;
	private $privateKey;
	private $token;
	private $httpHeaders;
	private $contentType;
	
	/**
	 * 
	 * @param int $version
	 * @param string $secureUrl
	 * @param string $privateKey
	 * @param string $token
	 * @param string $contentType
	 */
	function __construct($version, $secureUrl, $privateKey, $token, $contentType = 'json') 
	{
		$this->url         = 'https://apirest.3dcart.com/3dCartWebAPI/v' . $version . '/';
		$this->secureUrl   = $secureUrl;
		$this->privateKey  = $privateKey;
		$this->token       = $token;
		$this->contentType = $contentType;
		$this->httpHeaders = array(
				'SecureUrl: ' . $this->secureUrl,
				'PrivateKey: ' . $this->privateKey,
				'Token: ' . $this->token,
		);
		if ($this->contentType === 'xml') {
			array_push($this->httpHeaders, 'Content-Type: application/xml; charset=utf-8');
			array_push($this->httpHeaders, 'Accept: application/xml');
		} else {
			array_push($this->httpHeaders, 'Content-Type: application/json; charset=utf-8');
			array_push($this->httpHeaders, 'Accept: application/json');
		}
	}
	
	/**
	 * Adds a new product to the database
	 * @param array $product
	 * @return <mixed, string>
	 */
	public function addProduct(array $product)
	{
		$this->url .= 'Products';
		$ch = curl_init($this->url);
		$postBody = json_encode($product);
		array_push($this->httpHeaders, 'Content-Length: ' . strlen($postBody));
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postBody);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $this->httpHeaders);
		// [ ... addtional cURL options as needed ... ]
		$response = curl_exec($ch);
		if ($response === false) {
			$response = curl_error($ch);
		}
		curl_close($ch);
		return $response;
	}
}
// elsewhere...
$version = 1;                                 // API version
$secureUrl = 'sandbox-ecommercefoundation-org.3dcartstores.com';   // Secure URL is set in Settings->General->StoreSettings
$privateKey = '39a0a8a61784d7ecc7e6003b0ed800cf'; // Private key is obtained when registering your app at http://devportal.3dcart.com
$token = '32261413c5505aa86fcdbcc0a44ebb48';      // The token is generated when a customer authorizes your app
$contentType = 'json';                            // Can be set to json or xml (default = json)
$product = array(
		'SKUInfo' => array(
				'CatalogID'   => 1,
				'SKU'         => '10223',
				'Name'        => 'Custom Cap 3',
				'Cost'        => 9.00,
				'Price'       => 17.99,
				'RetailPrice' => 19.99,
				'SalePrice'   => 16.49,
				'OnSale'      => true,
		),
		'MFGID'            => null,
		'ShortDescription' => 'Adjustable, brushed cotton cap',
		'ManufacturerID'   => null,
		'DistributorList'  => array(
				array(
						'DistributorID'       => 1,
						'DistributorName'     => 'Sample Dsitributor 1',
						'DistributorItemCost' => 1.00,
						'DistributorItemID'   => 'Distributor Item ID',
						'DistributorStockID'  => 'Distributor Stock ID',
				),
				array(
						'DistributorID'       => 2,
						'DistributorName'     => 'Sample Dsitributor 2',
						'DistributorItemCost' => 1.00,
						'DistributorItemID'   => 'Distributor Item ID',
						'DistributorStockID'  => 'Distributor Stock ID',
				),
				array(
						'DistributorID'       => 3,
						'DistributorName'     => 'Sample Dsitributor 3',
						'DistributorItemCost' => 1.00,
						'DistributorItemID'   => 'Distributor Item ID',
						'DistributorStockID'  => 'Distributor Stock ID',
				),
		),
		'CategoryList' => array(
				array(
						'CategoryID'   => 1,
						'CategoryName' => 'Sample Category 1',
				),
				array(
						'CategoryID'   => 2,
						'CategoryName' => 'Sample Category 2',
				),
				array(
						'CategoryID'   => 3,
						'CategoryName' => 'Sample Category 3',
				),
		),
		'NonTaxable'      => false,
		'NotForSale'      => false,
		'Hide'            => false,
		'GiftCertificate' => false,
		'HomeSpecial'     => false,
		'CategorySpecial' => false,
		'NonSearchable'   => false,
		'NoGiftWrap'      => false,
		'ShipCost'        => 0,
		'Weight'          => 0.865,
		'Height'          => 5,
		'Width'           => 7,
		'Depth'           => 8,
		'SelfShip'        => false,
		'FreeShipping'    => true,
		'RewardPoints'    => 20,
		'RedeemPoints'    => 18,
		'DisableRewards'  => false,
		'Stock'           => 999,
		'StockAlert'      => 5,
		'ReorderQuantity' => 500,
		'InStockMessage'  => 'In Stock!',
		'OutOfStockMessage' => "We're sorry, this item is currently out of stock.",
		'BackOrderMessage'  => "This item is currently out of stock, however, we will still accept your order and it will be fulfilled when the item is in stock.",
		'WarehouseLocation' => null,
		'WarehouseBin'      => null,
		'WarehouseAisle'    => null,
		'WarehouseCustom'   => null,
		'Description'       => '<DIV><STRONG><SPAN style="COLOR: #ff0000">SAMPLE PRODUCT </SPAN></STRONG></DIV> <DIV>&nbsp;</DIV> <DIV>Our adjustable, 100% brushed cotton Cap is unstructured and an ideal way to beat the heat.</DIV>',
		'Keywords'          => 'adjustable, custom, cap',
		'ExtraField1'       => null,
		'ExtraField2'       => null,
		'ExtraField3'       => null,
		'ExtraField4'       => null,
		'ExtraField5'       => null,
		'ExtraField6'       => null,
		'ExtraField7'       => null,
		'ExtraField8'       => null,
		'ExtraField9'       => null,
		'ExtraField10'      => null,
		'ExtraField11'      => null,
		'ExtraField12'      => null,
		'ExtraField13'      => null,
		'FeatureList'       => array(
				array(
						'FeatureID'   => 1,
						'FeatureName' => 'Adjustable',
				),
				array(
						'FeatureID'   => 2,
						'FeatureName' => 'Custom',
				),
				array(
						'FeatureID'   => 3,
						'FeatureName' => '100% brushed cotton',
				),
		),
		'MainImageFile'           => 'assets/images/default/cap.jpg',
		'MainImageCaption'        => null,
		'ThumbnailFile'           => 'assets/images/default/cap_thumbnail.jpg',
		'MediaFile'               => null,
		'AdditionalImageFile2'    => null,
		'AdditionalImageCaption2' => null,
		'AdditionalImageFile3'    => null,
		'AdditionalImageCaption3' => null,
		'AdditionalImageFile4'    => null,
		'AdditionalImageCaption4' => null,
		'ImageGalleryList'        => array(),
		'OptionSetList'           => array(),
		'AdvancedOptionList'      => array(),
		'RelatedProductList'      => array(),
		'UpSellingItemList'       => array(),
		'DiscountList'            => array(
				array(
						'DiscountID' => 1,
						'DiscountPriceLevel' => 1,
						'DiscountLowbound'   => 3,
						'DiscountUpbound'    => 5,
						'DiscountPrice'      => 10.00,
						'DiscountPercentage' => true,
				),
				array(
						'DiscountID' => 2,
						'DiscountPriceLevel' => 1,
						'DiscountLowbound'   => 6,
						'DiscountUpbound'    => 10,
						'DiscountPrice'      => 10.00,
						'DiscountPercentage' => true,
				),
				array(
						'DiscountID' => 3,
						'DiscountPriceLevel' => 1,
						'DiscountLowbound'   => 11,
						'DiscountUpbound'    => 999,
						'DiscountPrice'      => 10.00,
						'DiscountPercentage' => true,
				),
		),
		'DoNotUseCategoryOptions'        => false,
		'ListingTemplateID'              => false,
		'ListingTemplateName'            => null,
		'LoginRequiredOptionID'          => 0,
		'LoginRequiredOptionName'        => null,
		'LoginRequiredOptionRedirectTo'  => null,
		'AllowAccessCustomerGroupID'     => 0,
		'AllowAccessCustomerGroupName'   => null,
		'RMAMaxPeriod'                   => null,
		'TaxCode'                        => null,
		'DisplayText'                    => null,
		'MinimumQuantity'                => 1.00,
		'MaximumQuantity'                => 0.00,
		'AllowOnlyMultiples'             => false,
		'AllowFractionalQuantity'        => false,
		'QuantityOptions'                => null,
		'GroupOptionsForQuantityPricing' => false,
		'ApplyQuantityDiscountToOptions' => false,
		'EnableMakeAnOfferFeature'       => true,
		'MinimumAcceptableOffer'         => null,
		'PriceLevel1'                    => 0.00,
		'PriceLevel1Hide'                => false,
		'PriceLevel2'                    => 0.00,
		'PriceLevel2Hide'                => false,
		'PriceLevel3'                    => 0.00,
		'PriceLevel3Hide'                => false,
		'PriceLevel4'                    => 0.00,
		'PriceLevel4Hide'                => false,
		'PriceLevel5'                    => 0.00,
		'PriceLevel5Hide'                => false,
		'PriceLevel6'                    => 0.00,
		'PriceLevel6Hide'                => false,
		'PriceLevel7'                    => 0.00,
		'PriceLevel7Hide'                => false,
		'PriceLevel8'                    => 0.00,
		'PriceLevel8Hide'                => false,
		'PriceLevel9'                    => 0.00,
		'PriceLevel9Hide'                => false,
		'PriceLevel10'                   => 0.00,
		'PriceLevel10Hide'               => false,
		'BuyButtonLink'                  => null,
		'ProductLink'                    => 'http://3dcart-qa-store-access.3dcartstores.comproduct.asp?itemid=2',
		'Title'                          => null,
		'CustomFileName'                 => 'custom-cap2.html',
		'RedirectLink'                   => null,
		'MetaTags'                       => null,
		'SpecialInstructions'            => null,
		'AssignKey'                      => false,
		'ReUseKeys'                      => false,
		'SerialList'                     => array(),
		'EProductList'                   => array(),							
);
 
$client = new RestClient($version, $secureUrl, $privateKey, $token, $contentType);
$response = $client->addProduct($product);

print_r($response);