<?php 
	$body = file_get_contents('php://input');
	mail('ankit@geeksperhour.com','redirect url',print_r($body,true)); 

	print_r($_SERVER);

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <title>App Setting</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
<body>

<div class="container">
  <h2>Redirect page </h2>
  <form action="/action_page.php">
    <div class="form-group">
      <label for="email">Client ID:</label>
      <input type="text" class="form-control" id="email" placeholder="CLient ID" name="email">
    </div>
    <div class="form-group">
      <label for="pwd">Client secret:</label>
      <input type="password" class="form-control" id="pwd" placeholder="Client Secret" name="pwd">
    </div>
    
    <button type="submit" class="btn btn-default">Submit</button>
  </form>
</div>

</body>
</html>
