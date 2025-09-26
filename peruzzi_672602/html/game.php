
<?php

    session_start();

    define('ACCESS_ALLOWED',true );
    require_once '../php/game_status.php';

    
    if(!isset($_SESSION['player_1']) || !isset($_SESSION['player_2'])){
        header('Location: errors/Unauthorized.html');
        exit;
    }


    $white_player;
    $black_player;
    
    if(rand(1,100) <= 50 ){
        $white_player = $_SESSION['player_1'];
        $black_player = $_SESSION['player_2'];
    }else{
        $black_player = $_SESSION['player_1'];
        $white_player = $_SESSION['player_2'];
    }
    
    if(!isset($_SESSION['initial_time']) || !isset($_SESSION['time_increment'])){
        $_SESSION['initial_time'] = 180;
        $_SESSION['time_increment'] = 2;
    }

    $_SESSION['init_info'] = ['board' => initiate_board() , 'initial_time' => $_SESSION['initial_time'] , 
                                'time_increment' => $_SESSION['time_increment'] , 'white_player' => $white_player ,
                                'black_player' => $black_player ];
    if(!isset($_SESSION['first_request'])){
        $_SESSION['first_request'] = true;
    }
    
?>


<!DOCTYPE html>
<html lang="en">
<head>
    
    <script src="../js/error_handling.js"></script>
    <script src="../js/game.js"></script>
    <script src="../js/game_interface_fun.js"></script>
    <script src="../js/select_moves.js"></script>
    <script src="../js/php_game_requests.js"></script>

    <link rel="stylesheet" href="../css/game.css">

    <link rel="icon" href="../images/pezzi/pawn_white.svg">
    <title>Chess</title>

</head>
    
<body id="body">
    <div id="left" class="player_container">


        <div>
            <img src="../images/pezzi/king_white.svg" alt="">
            <div id="white_player"></div>
            <div id="white_timer" class="timer">
                <div id="white_time"></div>
            </div>
        </div>


        
        <div class="capture_box">
        
            <img src="../images/pezzi/pawn_white.svg" alt="">
            <img src="../images/pezzi/rook_white.svg" alt="">
            <img src="../images/pezzi/bishop_white.svg" alt="">
            <img src="../images/pezzi/knight_white.svg" alt="">
            <img src="../images/pezzi/queen_white.svg" alt="">
        
        
            <div id="eaten_white_pawn">x0</div>
            <div id="eaten_white_rook">x0</div>
            <div id="eaten_white_bishop">x0</div>
            <div id="eaten_white_knight">x0</div>
            <div id="eaten_white_queen">x0</div>
            
        </div>
    </div>
    <div id="board"></div>

    <div id="right" class="player_container">

        <div>
            <img src="../images/pezzi/king_black.svg" alt="">
            <div id="black_player"></div>
            <div id="black_timer" class="timer">
                <div id="black_time"></div>
            </div>
        </div>

        <div class="capture_box">
            
            <img src="../images/pezzi/pawn_black.svg" alt="">
            <img src="../images/pezzi/rook_black.svg" alt="">
            <img src="../images/pezzi/bishop_black.svg" alt="">
            <img src="../images/pezzi/knight_black.svg" alt="">
            <img src="../images/pezzi/queen_black.svg" alt="">
        
            <div id="eaten_black_pawn">x0</div>
            <div id="eaten_black_rook">x0</div>
            <div id="eaten_black_bishop">x0</div>
            <div id="eaten_black_knight">x0</div>
            <div id="eaten_black_queen">x0</div>
           
        
        </div>

    </div>
</body>
</html>
