<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id_penjualan'])) {
            $id = $_GET['id_penjualan'];
            $stmt = $conn->prepare("
                SELECT p.*, ps.nama_pasien 
                FROM penjualan p 
                LEFT JOIN pasien ps ON p.id_pasien = ps.id_pasien 
                WHERE p.id_penjualan = ?
            ");
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("
                SELECT p.*, ps.nama_pasien 
                FROM penjualan p 
                LEFT JOIN pasien ps ON p.id_pasien = ps.id_pasien 
                ORDER BY p.tanggal_penjualan DESC
            ");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $penjualan = $result->fetch_all(MYSQLI_ASSOC);
        
        sendResponse($penjualan);
        break;
        
    case 'POST':
        $input = getInput();
        
        // Mulai transaction
        $conn->begin_transaction();
        
        try {
            // Insert penjualan
            $stmt = $conn->prepare("INSERT INTO penjualan (id_pasien, tanggal_penjualan, total_harga, metode_pembayaran) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isds", 
                $input['id_pasien'], 
                $input['tanggal_penjualan'], 
                $input['total_harga'], 
                $input['metode_pembayaran']
            );
            
            $stmt->execute();
            $id_penjualan = $stmt->insert_id;
            
            // Insert detail penjualan dan update stok
            foreach ($input['items'] as $item) {
                // Insert detail
                $stmt_detail = $conn->prepare("INSERT INTO detail_penjualan (id_penjualan, id_obat, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)");
                $stmt_detail->bind_param("iiidd", $id_penjualan, $item['id_obat'], $item['jumlah'], $item['harga_satuan'], $item['subtotal']);
                $stmt_detail->execute();
                
                // Update stok obat
                $stmt_update = $conn->prepare("UPDATE obat SET stok = stok - ? WHERE id_obat = ?");
                $stmt_update->bind_param("ii", $item['jumlah'], $item['id_obat']);
                $stmt_update->execute();
            }
            
            $conn->commit();
            sendResponse(['message' => 'Penjualan berhasil dicatat', 'id_penjualan' => $id_penjualan], 201);
            
        } catch (Exception $e) {
            $conn->rollback();
            sendResponse(['error' => 'Gagal mencatat penjualan: ' . $e->getMessage()], 500);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>