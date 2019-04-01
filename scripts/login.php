<?php
session_start();
require_once('db.php');
$email = $_POST['email'];
$pass = md5($_POST['pass']);
$admin = $_POST['a'];
$q = mysqli_query($con, "SELECT * FROM users WHERE email = '$email' AND password = '$pass' and admin = '$admin'");
if(mysqli_num_rows($q) == 1) {
	$r = mysqli_fetch_array($q , MYSQLI_ASSOC);
	$_SESSION['username'] = $r['username'];
	$_SESSION['email'] = $r['email'];
	$_SESSION['admin'] = $r['admin'];
	$name = $r['fname'] . " ". $r['lname'];
	//echo $mem->get(session_id());
	$cookie_name = "sessionid";
	$cookie_value = session_id();
	setcookie("name", $name, time() + (3600), "/");
	setcookie($cookie_name, $cookie_value, time() + (3600), "/", "vps.bloodrp.com",true,false);
	echo "check";
	}
	