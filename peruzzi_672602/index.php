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
    <link rel="stylesheet" href="css/index.css">

    <script src="js/error_handling.js"></script>
    <script src="js/index.js"></script>
    <script src="js/msg.js"></script>

    <link rel="icon" href="images/pezzi/pawn_white.svg">
    <title>Chess</title>
</head>

<body>
    <div id="menu" class="closed_menu">
        <img src="images/menu.svg" id="menu_icon" alt="">
    </div>
    <div id="title">
        <img src="images/pezzi/rook_white.svg" alt="">
        CHESS
        <img src="images/pezzi/knight_white.svg" alt="">
    </div>

    <div id="left" class="login_box">
        <h1 class="player">PLAYER 1</h1>

        <div id="player_box_1">

            <label for="player_1">Username: </label>
            <input type="text" name="player_1" id="player_1" placeholder="Mario" required>

            <label for="player_1_pass">Password: </label>
            <input type="password" name="player_1_pass" id="player_1_pass" placeholder="••••••••" required>

            <button class="login_btn" id="1">Log in</button>
            <button id="reset_1" class="reset_btn">Reset</button>
        </div>
    </div>

    <div id="right" class="login_box">
        <h1 class="player">PLAYER 2</h1>

        <div id="player_box_2">

            <label for="player_2">Username: </label>
            <input type="text" name="player_2" id="player_2" placeholder="Tommaso" required>

            <label for="player_2_pass">Password: </label>
            <input type="password" name="player_2_pass" id="player_2_pass" placeholder="••••••••" required>

            <button class="login_btn" id="2">Log in</button>
            <button id="reset_2" class="reset_btn">Reset</button>

        </div>
    </div>

    <div id="mode_container">

        <button id="180|2" class="selected_mode">Blitz</button>
        <button id="720|3">Rapid</button>
        <button id="3600|30">Standard</button>

    </div>

    <button id="play_button">PLAY</button>
    <button id="check_games_button">CHECK GAMES</button>
</body>

</html>