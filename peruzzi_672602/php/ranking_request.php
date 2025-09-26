<?php

define('ACCESS_ALLOWED',true);
require_once 'DB_connection.php';


get_ranks();

function get_ranks(){

    try{

        $conn = new DBconnection();
        $pdo = $conn->pdo;
        
        $stmt = $pdo->prepare("SELECT username, elo FROM Users WHERE username <> 'DELETED' ORDER BY elo DESC LIMIT 5");
        $stmt->execute();
        
        $ranks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($ranks);
        
        $conn->kill();
    }catch(PDOException $e){
        http_response_code(500);
        exit;
    }



}





?>