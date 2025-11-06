<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id_resep'])) {
            $id = $_GET['id_resep'];
            $stmt = $conn->prepare("
                SELECT r.*, p.nama_pasien, d.nama_dokter 
                FROM resep r 
                LEFT JOIN pasien p ON r.id_pasien = p.id_pasien 
                LEFT JOIN dokter d ON r.id_dokter = d.id_dokter 
                WHERE r.id_resep = ?
            ");
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("
                SELECT r.*, p.nama_pasien, d.nama_dokter 
                FROM resep r 
                LEFT JOIN pasien p ON r.id_pasien = p.id_pasien 
                LEFT JOIN dokter d ON r.id_dokter = d.id_dokter 
                ORDER BY r.tanggal_resep DESC
            ");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $resep = $result->fetch_all(MYSQLI_ASSOC);
        
        sendResponse($resep);
        break;
        
    case 'POST':
        $input = getInput();
        
        // Mulai transaction
        $conn->begin_transaction();
        
        try {
            // Insert resep
            $stmt = $conn->prepare("INSERT INTO resep (id_pasien, id_dokter, tanggal_resep, catatan) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiss", 
                $input['id_pasien'], 
                $input['id_dokter'], 
                $input['tanggal_resep'], 
                $input['catatan']
            );
            
            $stmt->execute();
            $id_resep = $stmt->insert_id;
            
            // Insert detail resep
            foreach ($input['items'] as $item) {
                $stmt_detail = $conn->prepare("INSERT INTO detail_resep (id_resep, id_obat, jumlah, instruksi_penggunaan) VALUES (?, ?, ?, ?)");
                $stmt_detail->bind_param("iiis", $id_resep, $item['id_obat'], $item['jumlah'], $item['instruksi_penggunaan']);
                $stmt_detail->execute();
            }
            
            $conn->commit();
            sendResponse(['message' => 'Resep berhasil dibuat', 'id_resep' => $id_resep], 201);
            
        } catch (Exception $e) {
            $conn->rollback();
            sendResponse(['error' => 'Gagal membuat resep: ' . $e->getMessage()], 500);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>