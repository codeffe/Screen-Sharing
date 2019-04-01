<?php
require_once('db.php');
$d = $_POST['d'];
$user = $d[0]['value'];
$rank = $d[1]['value'];
$fname = $d[2]['value'];
$lname = $d[3]['value'];
$pass = md5($d[4]['value']);
$email = $d[5]['value'];
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo "Invalid email format. Try Again."; exit;
}
$q = mysqli_query($con,"SELECT * FROM users WHERE username = '$user' OR email = '$email'");
if(mysqli_num_rows($q) == 0) {
	$quc = mysqli_query($con,"INSERT INTO users (username,fname,lname,password,admin,email) VALUES('$user','$fname','$lname','$pass','$rank','$email')"); 
	if($quc) echo "success";
}
else {
	echo "A user with this username or email exists.";
}

