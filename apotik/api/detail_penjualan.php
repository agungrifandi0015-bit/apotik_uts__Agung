<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id_penjualan'])) {
            $id_penjualan = $_GET['id_penjualan'];
            $stmt = $conn->prepare("
                SELECT dp.*, o.nama_obat, o.jenis_obat 
                FROM detail_penjualan dp 
                JOIN obat o ON dp.id_obat = o.id_obat 
                WHERE dp.id_penjualan = ?
            ");
            $stmt->bind_param("i", $id_penjualan);
            $stmt->execute();
            $result = $stmt->get_result();
            $detail = $result->fetch_all(MYSQLI_ASSOC);
            
            sendResponse($detail);
        } else {
            sendResponse(['error' => 'ID penjualan diperlukan'], 400);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>