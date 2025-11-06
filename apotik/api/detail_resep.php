<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id_resep'])) {
            $id_resep = $_GET['id_resep'];
            $stmt = $conn->prepare("
                SELECT dr.*, o.nama_obat, o.dosis, o.harga 
                FROM detail_resep dr 
                JOIN obat o ON dr.id_obat = o.id_obat 
                WHERE dr.id_resep = ?
            ");
            $stmt->bind_param("i", $id_resep);
            $stmt->execute();
            $result = $stmt->get_result();
            $detail = $result->fetch_all(MYSQLI_ASSOC);
            
            sendResponse($detail);
        } else {
            sendResponse(['error' => 'ID resep diperlukan'], 400);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>