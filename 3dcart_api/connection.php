<?php 

	$SERVER_SERVER = "localhost";//your host name
	$SERVER_USER = "elearnu5_elearn";//Your database username
	$SERVER_PASSWORD = "d++?Fqgk)@TP";//your database passwo
	$DATABASE_NAME = "elearnu5_elearningmitra_latest";//your database name

	// Create connection
	$conn = mysqli_connect($SERVER_SERVER, $SERVER_USER, $SERVER_PASSWORD,$DATABASE_NAME);

	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_connect_error());
	}
	