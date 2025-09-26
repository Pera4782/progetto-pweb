<?php

define('ACCESS_ALLOWED',true);
require_once "DB_connection.php";


function update_status($username, $pdo){

    $stmt = $pdo->prepare("UPDATE Games SET white_player = 'DELETED' WHERE white_player = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    $stmt = $pdo->prepare("UPDATE Games SET black_player = 'DELETED' WHERE black_player = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    $stmt = $pdo->prepare("DELETE FROM Games WHERE white_player = 'DELETED' AND black_player = 'DELETED'");
    $stmt->execute();
}


function delete($username,$password){

    try{
        $conn = new DBconnection();
        $pdo = $conn->pdo;

        $stmt = $pdo->prepare('SELECT * FROM Users WHERE username=:username');
        $stmt->bindParam(':username',$username);
        $stmt->execute();

        if($stmt->rowCount() === 0 || $username === 'DELETED'){
            http_response_code(401);
            echo json_encode(['message' => "Username does not exist"]);
            return;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $hashed_password = $user['password'];

        if(!password_verify($password,$hashed_password)){
            http_response_code(401);
            echo json_encode(['message' => 'Wrong password']);
            return;
        }

        $pdo->beginTransaction();

        update_status($username, $pdo);

        $stmt = $pdo->prepare("DELETE FROM Users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $pdo->commit();
        $conn->kill();

    }catch (PDOException $e){
        $pdo->rollBack();
        http_response_code(500);
        exit;
    }

}


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

delete($username,$password);

?>