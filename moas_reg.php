<?php
	exec("sudo delete_odk_data.sh");
	exec("sudo get_odk_data.sh &");
	header('Location: moas_reg.html');
	exit;
?>
