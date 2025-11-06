<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id_pasien'])) {
            $id = $_GET['id_pasien'];
            $stmt = $conn->prepare("SELECT * FROM pasien WHERE id_pasien = ?");
            $stmt->bind_param("i", $id);
        } else {
            $stmt = $conn->prepare("SELECT * FROM pasien");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $pasien = $result->fetch_all(MYSQLI_ASSOC);
        
        sendResponse($pasien);
        break;
        
    case 'POST':
        $input = getInput();
        $stmt = $conn->prepare("INSERT INTO pasien (nama_pasien, alamat, no_telepon, tanggal_lahir, jenis_kelamin, riwayat_penyakit) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", 
            $input['nama_pasien'], 
            $input['alamat'], 
            $input['no_telepon'], 
            $input['tanggal_lahir'], 
            $input['jenis_kelamin'], 
            $input['riwayat_penyakit']
        );
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Pasien berhasil ditambahkan', 'id' => $stmt->insert_id], 201);
        } else {
            sendResponse(['error' => 'Gagal menambahkan pasien'], 500);
        }
        break;
        
    case 'PUT':
        $input = getInput();
        $stmt = $conn->prepare("UPDATE pasien SET nama_pasien=?, alamat=?, no_telepon=?, tanggal_lahir=?, jenis_kelamin=?, riwayat_penyakit=? WHERE id_pasien=?");
        $stmt->bind_param("ssssssi", 
            $input['nama_pasien'], 
            $input['alamat'], 
            $input['no_telepon'], 
            $input['tanggal_lahir'], 
            $input['jenis_kelamin'], 
            $input['riwayat_penyakit'],
            $input['id_pasien']
        );
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Pasien berhasil diupdate']);
        } else {
            sendResponse(['error' => 'Gagal mengupdate pasien'], 500);
        }
        break;
        
    case 'DELETE':
        $input = getInput();
        $stmt = $conn->prepare("DELETE FROM pasien WHERE id_pasien = ?");
        $stmt->bind_param("i", $input['id_pasien']);
        
        if ($stmt->execute()) {
            sendResponse(['message' => 'Pasien berhasil dihapus']);
        } else {
            sendResponse(['error' => 'Gagal menghapus pasien'], 500);
        }
        break;
        
    default:
        sendResponse(['error' => 'Method tidak diizinkan'], 405);
        break;
}
?>