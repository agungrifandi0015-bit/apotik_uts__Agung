<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Ambil semua dokter atau dokter tertentu
        if (isset($_GET['id_dokter'])) {
            $id = $_GET['id_dokter'];
            $stmt = $conn->prepare("SELECT * FROM dokter WHERE id_dokter = ?");
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("SELECT * FROM dokter");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $dokter = $result->fetch_all(MYSQLI_ASSOC);
        
        sendResponse($dokter);
        break;
        
    case 'POST':
        // Tambah dokter baru
        $input = getInput();
        $stmt = $conn->prepare("INSERT INTO dokter (nama_dokter, spesialisasi, no_telepon, alamat, nomor_sip) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", 
            $input['nama_dokter'], 
            $input['spesialisasi'], 
            $input['no_telepon'], 
            $input['alamat'], 
            $input['nomor_sip']
        );
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Dokter berhasil ditambahkan', 'id' => $stmt->insert_id], 201);
        } else {
            sendResponse(['error' => 'Gagal menambahkan dokter'], 500);
        }
        break;
        
    case 'PUT':
        // Update dokter
        $input = getInput();
        $stmt = $conn->prepare("UPDATE dokter SET nama_dokter=?, spesialisasi=?, no_telepon=?, alamat=?, nomor_sip=? WHERE id_dokter=?");
        $stmt->bind_param("sssssi", 
            $input['nama_dokter'], 
            $input['spesialisasi'], 
            $input['no_telepon'], 
            $input['alamat'], 
            $input['nomor_sip'],
            $input['id_dokter']
        );
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Dokter berhasil diupdate']);
        } else {
            sendResponse(['error' => 'Gagal mengupdate dokter'], 500);
        }
        break;
        
    case 'DELETE':
        // Hapus dokter
        $input = getInput();
        $stmt = $conn->prepare("DELETE FROM dokter WHERE id_dokter = ?");
        $stmt->bind_param("i", $input['id_dokter']);
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Dokter berhasil dihapus']);
        } else {
            sendResponse(['error' => 'Gagal menghapus dokter'], 500);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>