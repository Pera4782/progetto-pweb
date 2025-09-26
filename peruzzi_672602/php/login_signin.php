<?php

session_start();

define('ACCESS_ALLOWED',true);
require_once 'DB_connection.php';


switch ($_REQUEST['type']) {
    case 'logged':
        if (isset($_SESSION['player_1']) && isset($_SESSION['player_2']))
            echo json_encode(true);
        else
            echo json_encode(false);
        break;

    case 'send_login':
        send_login_request();
        break;
    
    case 'sign_in':
        sign_in_request();
        break;
    case 'log_out':
        log_out_request();
        break;

    default:
        http_response_code(400);
        exit;
}


function send_login_request(){

    if(!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['player'])){
        http_response_code(400);
        exit;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];
    $player = json_decode($_POST['player']);

    if($player != 1 && $player != 2){
        http_response_code(400);
        exit;
    }

    if(isset($_SESSION['player_' . $player])){
        http_response_code(401);
        echo json_encode(['message' => 'User already logged']);
        exit;
    }

    $other_player = ($player === 1)? 2 : 1;
    if(isset($_SESSION['player_' . $other_player]) && $_SESSION['player_' . $other_player] === $username){
        http_response_code(401);
        echo json_encode(['message' => 'User already logged']);
        exit;
    }

    $username_pattern = '/^[a-zA-Z]([a-zA-Z0-9]){4,9}$/';
    $password_pattern = '/^(?=.*[@.!])[a-zA-Z0-9@.!]{5,10}$/';

    if(!preg_match($username_pattern,$username) || !preg_match($password_pattern,$password)){
        http_response_code(401);
        echo json_encode(['message' => 'Username or Password has been incorrectly entered']);
        exit;
    }

    try{
        $conn = new DBconnection();
        $pdo = $conn->pdo;

        $stmt = $pdo->prepare('SELECT * FROM Users WHERE username=:username');

        $stmt->bindParam(':username',$username);
        $stmt->execute();

        if($stmt->rowCount() === 0 || $username === 'DELETED'){
            http_response_code(401);
            echo json_encode(['message' => 'Username does not exist']);
            exit;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!password_verify($password,$user['password'])){
            http_response_code(401);
            echo json_encode(['message' => 'wrong Password']);
            exit;
        }

        echo json_encode($user['elo']);
        $conn->kill();
    }catch(PDOException $e){
        http_response_code(500);
        exit;
    }
    
    $_SESSION['player_' . $player] = $username;
}


function sign_in_request(){

    if(!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['confirm_password'])){
        http_response_code(400);
        exit;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    $username_pattern = '/^[a-zA-Z]([a-zA-Z0-9]){4,9}$/';
    $password_pattern = '/^(?=.*[@.!])[a-zA-Z0-9@.!]{5,10}$/';
    
    if(!preg_match($username_pattern,$username) || !preg_match($password_pattern,$password)){
        http_response_code(401);
        echo json_encode(['message' => 'Username or Password has been incorrectly entered']);
        exit;
    }
    
    if($confirm_password !== $password){
        http_response_code(401);
        echo json_encode(['message' => 'Typed Passwords are not the same']);
        exit;
    }
    
    if($username == 'DELETED'){
        http_response_code(401);
        echo json_encode(['message' => 'Username is not allowed']);
        exit;
    }
    
    try{

        $conn = new DBconnection();
        $pdo = $conn->pdo;

        $stmt = $pdo->prepare('SELECT * FROM Users WHERE username=:username');
        $stmt->bindParam(':username',$username);
        $stmt->execute();
        if($stmt->rowCount() !== 0){
            http_response_code(401);
            echo json_encode(['message' => 'Username already taken']);
            exit;
        }


        $stmt = $pdo->prepare('INSERT INTO Users VALUES (:username,:password,800)');
        
        $hashed_password = password_hash($password,PASSWORD_BCRYPT);
        
        $stmt->bindParam(':username',$username);
        $stmt->bindParam(':password',$hashed_password);
        
        $stmt->execute();
        
        $conn->kill();

    }catch(PDOException $e){
        http_response_code(500);
        exit;
    }
}

function log_out_request(){

    $player = json_decode($_POST['player']);

    if(($player !== 1 && $player !== 2) && !isset($_SESSION['player_' . $player])){
        http_response_code(400);
        exit;
    }
        
    unset($_SESSION['player_' . $player]);
}



  
?>