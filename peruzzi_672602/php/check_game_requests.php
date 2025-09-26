<?php

define('ACCESS_ALLOWED',true);
require_once 'DB_connection.php';


switch($_REQUEST['type']){

    case 'login':
        log_in();
        break;
    default:
        http_response_code(400);
        exit;

}


function log_in(){

    if(!isset($_POST['username']) || !isset($_POST['password'])){
        http_response_code(400);
        exit;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];


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
        $conn->kill();
    }catch(PDOException $e){
        http_response_code(500);
        exit;
    }

    get_games($username);

}


function get_games($username){

    try{
        
        $conn = new DBconnection();
        $pdo = $conn->pdo;

        $stmt = $pdo->prepare("SELECT * FROM Games WHERE white_player = :username OR black_player = :username ORDER BY id DESC LIMIT 5");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($stmt->rowCount() === 0){
            http_response_code(401);
            echo json_encode(['message' => "You haven't played any games yet"]);
            exit;
        }

        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($games);
        $conn->kill();
    }catch(PDOException $e){
        http_response_code(500);
        exit;
    }

}





?>