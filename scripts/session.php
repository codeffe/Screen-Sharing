<?php
session_start();
$arr = [0,0,0];
if(isset($_SESSION['username'])){
	$ss = session_id();
	$u = $_SESSION['username'];
	$a = $_SESSION['admin'];
	$arr = [$ss, $u, $a];
	}
echo json_encode($arr);
?>