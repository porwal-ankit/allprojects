<?php
/*	FACEBOOK LOGIN + LOGOUT - PHP SDK V4.0 - BOOTSTRAP THEME
 *	file 			- index.php
 * 	Developer 		- Geeksperhour
 *	Website			- http://geeksperhour.com/
 *	Date 			- 17 March 2016
 *	license			- GNU General Public License version 2 or later
*/

/* INCLUSION OF LIBRARY FILEs*/
	require_once( 'lib/Facebook/FacebookSession.php');
	require_once( 'lib/Facebook/FacebookRequest.php' );
	require_once( 'lib/Facebook/FacebookResponse.php' );
	require_once( 'lib/Facebook/FacebookSDKException.php' );
	require_once( 'lib/Facebook/FacebookRequestException.php' );
	require_once( 'lib/Facebook/FacebookRedirectLoginHelper.php');
	require_once( 'lib/Facebook/FacebookAuthorizationException.php' );
	require_once( 'lib/Facebook/GraphObject.php' );
	require_once( 'lib/Facebook/GraphUser.php' );
	require_once( 'lib/Facebook/GraphSessionInfo.php' );
	require_once( 'lib/Facebook/Entities/AccessToken.php');
	require_once( 'lib/Facebook/HttpClients/FacebookCurl.php' );
	require_once( 'lib/Facebook/HttpClients/FacebookHttpable.php');
	require_once( 'lib/Facebook/HttpClients/FacebookCurlHttpClient.php');

/* USE NAMESPACES */
	
	use Facebook\FacebookSession;
	use Facebook\FacebookRedirectLoginHelper;
	use Facebook\FacebookRequest;
	use Facebook\FacebookResponse;
	use Facebook\FacebookSDKException;
	use Facebook\FacebookRequestException;
	use Facebook\FacebookAuthorizationException;
	use Facebook\GraphObject;
	use Facebook\GraphUser;
	use Facebook\GraphSessionInfo;
	use Facebook\FacebookHttpable;
	use Facebook\FacebookCurlHttpClient;
	use Facebook\FacebookCurl;

/*PROCESS*/
	
	//1.Stat Session
	 session_start();

	//check if users wants to logout
	 if(isset($_REQUEST['logout'])){
	 	unset($_SESSION['fb_token']);
	 }
	
	//2.Use app id,secret and redirect url 
	$app_id = '1721390381408227';
	$app_secret = '1c054a31526629cdd0d9f83443ba5267';
	$redirect_url='http://research-target.com/';

	//3.Initialize application, create helper object and get fb sess
	 FacebookSession::setDefaultApplication($app_id,$app_secret);
	 $helper = new FacebookRedirectLoginHelper($redirect_url);
	 $sess = $helper->getSessionFromRedirect();

	 //check if facebook session exists
	if(isset($_SESSION['fb_token'])){
		$sess = new FacebookSession($_SESSION['fb_token']);
		try{
			$sess->Validate($id, $secret);
		}catch(FacebookAuthorizationException $e){
			print_r($e);
		}
	}

	$loggedin = false;
	//get email as well with user permission
	$login_url = $helper->getLoginUrl(array('email'));
	//logout
	$logout = 'http://localhost/fblogin&logout=true';

	//4. if fb sess exists echo name 
	 	if(isset($sess)){
	 		//store the token in the php session
	 		$_SESSION['fb_token']=$sess->getToken();
	 		//create request object,execute and capture response
	 		$request = new FacebookRequest($sess,'GET','/me');
			// from response get graph object
			$response = $request->execute();
			$graph = $response->getGraphObject(GraphUser::classname());
			// use graph object methods to get user details
			$id = $graph->getId();
			$name= $graph->getName();
			$email = $graph->getProperty('email');
			$image = 'https://graph.facebook.com/'.$id.'/picture?width=300';
			$loggedin  = true;
	}

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Facebook Login Demo</title>
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<style>
	body{
		background:#f8f8f8;
	}
	.main-container{
		width:400px;
		margin:30px auto 0px;
		background:white;
		padding:30px;
	}
	.footer{
		background:#ecf0f1;
		padding:30px;
		color:#7f8c8d;
		width:400px;
		margin: 0px auto;
	}
	</style>
  </head>
  <body>
  	<div class="main-container">
  	<?php if(!$loggedin){ ?>
	    <h1>Demo Login!</h1>
	    <p>This is a demo login page used for the packetcode video tutorial. It pulls user's Id, Name and Profile Image.</p>
	    <a href="<?php echo $login_url; ?>"><button class="btn btn-primary">Login with facebook</button></a>
    <?php }else { ?>
	    <img src="<?php echo $image; ?>" alt="<?php echo $name; ?>" class="img-thumbnail">

	    	<h1>hi <b><?php echo $name; ?></b></h1>
	    	<p>you have successfully logged in via facebook :) and your email is 
	    		<code><?php echo $email ; ?></code></p>
	    	<a href="<?php echo $logout; ?>">
	    		<button class="btn btn-primary">Logout</button>
	    	</a>	
		
    <?php } ?>
	</div>
	<div class="footer">a <a href="http://geeksperhour.com">GPH</a> production</div>
  </body>
</html>


