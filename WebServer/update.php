	
	<?php
	
	$servername = "localhost";
			$username = "root";
			$password = "";
			$dbname = "TrumpGame";
			$conn = new mysqli($servername, $username, $password, $dbname);
		
		
			if($conn->connect_error){
				
			}
			
			
			
				$username_c = $_POST['username']; //get input text
				$level = $_POST['level']; //get input text
				$mexNum = $_POST['mexNum']; //get input text
				$sql = "INSERT INTO LeaderBoard (Username, Level, MexicansCaught)
					VALUES ('".$username_c."', '".$level."', '".$mexNum."')";

				if ($conn->query($sql) === TRUE) {
					echo "New record created successfully";
				} else {
					echo "Error: " . $sql . "<br>" . $conn->error;
				}
				$conn->close();
			 
	?>