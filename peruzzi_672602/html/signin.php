
<?php
    session_start();
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="../js/signin.js"></script>
    <script src="../js/error_handling.js"></script>
    <script src="../js/msg.js"></script>
    <link rel="stylesheet" href="../css/menu.css">

    <link rel="icon" href="../images/pezzi/pawn_white.svg">
    <title>Chess</title>
</head>
<body>
    <button id="home_page">Return to home page</button>
    <div id="container">

        <h1>SIGN IN</h1>

        <div>
            <input type="text" placeholder="Username"id="username" required title="5 to 10 characters or characters, must start with a letter">
            <input type="password" placeholder="password" id="password" required title="5 to 10 characters, must contain a special simbol @ . or !">
            <input type="password" placeholder="confirm password" id="confirm_password" required>
            <div>
                <button id="sign_in">Sign in</button>
            </div>
        </div>
    </div>
</body>
</html>