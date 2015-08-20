<?php
	// shell_exec('./get_odk_data.sh > /dev/null 2>/dev/null &');
	//echo shell_exec('ls -a');

	//ignore_user_abort(true); // prevent the PHP script from being killed when the connection closes
	//echo "stuff";
	header("Location: /index.html");
	header("Connection: Close");
	flush();
	// the connection should now be closed, the user is redirected to index.html
?>
