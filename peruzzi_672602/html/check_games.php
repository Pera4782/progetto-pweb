
<?php

session_start();
session_unset();
session_destroy();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="../js/check_games.js"></script>
    <script src="../js/error_handling.js"></script>
    <script src="../js/msg.js"></script>
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/check_games.css">

    <link rel="icon" href="../images/pezzi/pawn_white.svg">
    <title>Chess</title>
</head>
<body>
    <button id="home_page">Return to home page</button>
    <div id="container">

        <h1>LOG IN</h1>

        <div>
            <input id="username" type="text" placeholder="Username">
            <input id="password" type="password" placeholder="Password">
            <div>
                <button id="log_in">Log in</button>
            </div>
        </div>
    </div>
</body>
</html>

