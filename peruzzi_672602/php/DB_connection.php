
<?php

if(!defined('ACCESS_ALLOWED')){
    http_response_code(403);
    header('Location: ../html/errors/Forbidden.html');
    exit;
}


class DBconnection {
    public $pdo;

    public function __construct(){

        $conn_info = 'mysql:host=localhost;dbname=peruzzi_672602';
        $username = 'root';
        $password = '';

        $this->pdo = new PDO($conn_info,$username,$password);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    
    }

    public function kill(){
        $this->pdo = null;
    }

}


?>