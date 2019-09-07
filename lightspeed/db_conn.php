<?php
    $conn = mysqli_connect("localhost","fashionfitr_lightspeed" ,"G2P1FpmRB","fashionfitr_lightspeed");

    if (mysqli_connect_errno())
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }

define('APP_KEY', '9edb507b4fca258de9b63e11b61c1a53');
define('APP_SECRET', 'a1540df69543485cfbd9f367d257d0a9');

?>