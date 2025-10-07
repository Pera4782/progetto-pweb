<?php

define('ACCESS_ALLOWED', true);

require_once "game_status.php";
require_once "DB_connection.php";

session_start();


if ($_SERVER['REQUEST_METHOD'] != 'POST' && $_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(403);
    header('Location: ../html/errors/Forbidden.html');
    exit;
}


switch ($_REQUEST['type']) {
    case 'get_info':
        get_info_request();
        break;
    case 'reload_game':
        reload_game_request();
        break;
    case 'send_status':
        send_status_request();
        break;
    case 'send_time':
        send_time_request();
        break;
    case 'end_game':
        end_game_request();
        break;
    case 'set_mode':
        set_mode_request();
        break;
    case 'is_first_request':
        echo json_encode($_SESSION['first_request']);
        break;
    case 'register_game':
        register_game_request();
        break;
    default:
        http_response_code(400);
        exit;
}


function get_info_request()
{

    if (!isset($_SESSION['init_info']) || !isset($_SESSION['first_request'])) {
        http_response_code(403);
        header('Location: ../html/errors/Forbidden.html');
        exit;
    }

    $_SESSION['first_request'] = false;
    $game_info = $_SESSION['init_info'];
    echo json_encode($game_info);
}

function reload_game_request()
{

    if (!isset($_SESSION['game_status'])) {
        http_response_code(403);
        header('Location: ../html/errors/Forbidden.html');
        exit;
    }

    $game_info = $_SESSION['game_status'];
    echo json_encode($game_info);
}

function send_status_request()
{

    if (
        !isset($_POST['white']) || !isset($_POST['black']) || !isset($_POST['initial_time'])
        || !isset($_POST['time_increment']) || !isset($_POST['board']) || !isset($_POST['turn'])
    ) {

        http_response_code(400);
        header('Location: ../html/errors/Bad_Request.html');
        exit;
    }


    $white_player = json_decode($_POST['white']);
    $black_player = json_decode($_POST['black']);
    $initial_time = json_decode($_POST['initial_time']);
    $time_increment = json_decode($_POST['time_increment']);
    $board = json_decode($_POST['board']);
    $turn = json_decode($_POST['turn']);

    $_SESSION['game_status'] = new Game_status($white_player, $black_player, $initial_time, $time_increment, $board, $turn);
}

function send_time_request()
{

    if (!isset($_POST['time']) || !isset($_POST['color'])) {
        http_response_code(400);
        header('Location: ../html/errors/Bad_Request.html');
        exit;
    }
    if (!isset($_SESSION['game_status'])) {
        http_response_code(403);
        header('Location: ../html/errors/Forbidden.html');
        exit;
    }

    $time = json_decode($_POST['time']);
    if ($_POST['color'] == 'white')
        $_SESSION['game_status']->white_player->time = $time;
    else
        $_SESSION['game_status']->black_player->time = $time;
}

function end_game_request()
{

    if (!isset($_POST['condition']) || !isset($_POST['color'])) {
        http_response_code(400);
        header('Location: ../html/errors/Bad_Request.html');
        exit;
    }


    if (!isset($_SESSION['game_status'])) {
        http_response_code(403);
        header('Location: ../html/errors/Forbidden.html');
        exit;
    }

    $condition = json_decode($_POST['condition']);
    $color = json_decode($_POST['color']);

    $_SESSION['game_status']->end_game_status['condition'] = $condition;
    $_SESSION['game_status']->end_game_status['color'] = $color;
}

function set_mode_request(){
    if(!isset($_POST['time_increment']) || !isset($_POST['initial_time'])){
        http_response_code(400);
        exit;
    }

    $time_increment = json_decode($_POST['time_increment']);
    $initial_time = json_decode($_POST['initial_time']);

    if($time_increment !== 2 && $time_increment !== 3 && $time_increment !== 30){
        http_response_code(400);
        exit;
    }
    if($initial_time !== 180 && $initial_time !== 720 && $initial_time !== 3600){
        http_response_code(400);
        exit;
    }


    $_SESSION['time_increment'] = (int)$time_increment;
    $_SESSION['initial_time'] = (int)$initial_time;

}


function register_game_request(){

    $end_game_cond = $_SESSION['game_status']->end_game_status['condition'].';'.$_SESSION['game_status']->end_game_status['color'];

    $new_elo = null;
    calculate_elo($end_game_cond,$new_elo);
    register_game($new_elo);   
}


function calculate_elo($condition,&$new_elo){

    try{

        $conn = new DBconnection();
        $pdo = $conn->pdo;

        define('K',20);

        $stmt = $pdo->prepare('SELECT username,elo FROM Users WHERE username=:white OR username=:black');
        $stmt->bindParam(':white',$_SESSION['init_info']['white_player']);
        $stmt->bindParam(':black',$_SESSION['init_info']['black_player']);
        $stmt->execute();

        $player1_stats = $stmt->fetch(PDO::FETCH_ASSOC);
        $player2_stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $old_elo = [];
        $old_elo[$player1_stats['username']] = $player1_stats['elo'];
        $old_elo[$player2_stats['username']] = $player2_stats['elo'];
        $player1 = $player1_stats['username'];
        $player2 = $player2_stats['username'];

        $E = [
            $player1 => 1 / ( 1 +  10 ** ( ( $old_elo[$player2] - $old_elo[$player1] ) / 400 ) ),
            $player2 => 1 / ( 1 +  10 ** ( ( $old_elo[$player1] - $old_elo[$player2] ) / 400 ) )
        ];
        
        $S = [
            $player1 => 0.5,
            $player2 => 0.5
        ];
        
        $end_game_status = explode(';',$condition);
        $end_game_condition = $end_game_status[0];
        $winning_player_color = $end_game_status[1];
        if($end_game_condition == 1){
            $losing_player_color = ($winning_player_color === 'white')? 'black' : 'white';
            $S[$_SESSION['init_info'][$winning_player_color . '_player']] = 1;
            $S[$_SESSION['init_info'][$losing_player_color . '_player']] = 0;
        }

        $new_elo1 = round($old_elo[$player1] + K * ( $S[$player1] - $E[$player1] ));
        $new_elo2 = round($old_elo[$player2] + K * ( $S[$player2] - $E[$player2] ));

        $new_elo = [
            $player1 => ($new_elo1 < 0)? 0 : $new_elo1,
            $player2 => ($new_elo2 < 0)? 0 : $new_elo2
        ];

        $conn->kill();
        return;
    }catch(PDOException $e){
        http_response_code(500);
        echo $e->getMessage();
        exit;
    }

}


function register_game($elo){
    try{

        $conn = new DBconnection();
        $pdo = $conn->pdo;

        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare('UPDATE Users SET elo=:elo WHERE username=:username');
        $stmt->bindParam(':elo', $elo[$_SESSION['init_info']['white_player']]);
        $stmt->bindParam(':username',$_SESSION['init_info']['white_player']);
        $stmt->execute();

        $stmt->bindParam(':elo', $elo[$_SESSION['init_info']['black_player']]);
        $stmt->bindParam(':username',$_SESSION['init_info']['black_player']);
        $stmt->execute();

        $stmt = $pdo->prepare('INSERT INTO Games(white_player,black_player,mode,winner)
                               VALUES(:white_player,:black_player,:mode,:winner)' );
        $mode = null;
        switch ($_SESSION['init_info']['initial_time']){
            case 180:
                $mode = 0;
                break;
            case 720:
                $mode = 1;
                break;
            case 3600:
                $mode = 2;
                break;
            default:
                http_response_code(500);
                exit;
        }

        $stmt->bindParam(':white_player',$_SESSION['init_info']['white_player']);
        $stmt->bindParam(':black_player',$_SESSION['init_info']['black_player']);
        $stmt->bindParam(':mode',$mode);
        $stmt->bindParam(':winner',$_SESSION['game_status']->end_game_status['color']);
        $stmt->execute();

        $pdo->commit();
        $conn->kill();

    }catch(PDOException $e){
        $pdo->rollBack();
        http_response_code(500);
        exit;
    }
}


?>