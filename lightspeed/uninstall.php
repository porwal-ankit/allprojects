<?php
require "vendor/autoload.php";
include 'config.php';


// Uninstall file
// --------------------------------------------------
if (
    isset($_GET['language'])
    && isset($_GET['shop_id'])
    && isset($_GET['signature'])
    && isset($_GET['timestamp'])
) {
    // Create the signature
    $params = array(
        'language'  => $_GET['language'],
        'shop_id'   => $_GET['shop_id'],
        'timestamp' => $_GET['timestamp']
    );

    ksort($params);

    $signature = '';

    foreach ($params as $key => $value) {
        $signature .= $key . '=' . $value;
    }

    $signature = md5($signature . APP_SECRET);

    // Validate the signature
    if ($signature == $_GET['signature']) {
        // Delete the store information from the database
        mysql_query("DELETE FROM shops WHERE shop_id = '" . mysql_real_escape_string($_GET['shop_id']) . "'");

        $shopId = $_GET['shop_id'];

        $result = mysqli_query($conn, "SELECT * FROM shop_scripts WHERE shop_id = '".$shopId."'");

        while ($row=mysqli_fetch_assoc($result))
        {
            $script_id  = $row['script_id'];
            $shopscript = $api->shopScripts->delete($script_id);
        }

        mysql_query("DELETE FROM shop_scripts WHERE shop_id = '" . mysql_real_escape_string($_GET['shop_id']) . "'");
    }

// header("Location:");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Uninstall Page</title>
</head>
<body>
App uninstall successfully from your store.
</body>
</html>