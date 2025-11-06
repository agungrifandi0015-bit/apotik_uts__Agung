<?php
require_once 'config.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetObat();
            break;
            
        case 'POST':
            handlePostObat();
            break;
            
        case 'PUT':
            handlePutObat();
            break;
            
        case 'DELETE':
            handleDeleteObat();
            break;
            
        default:
            sendResponse(['error' => 'Method tidak diizinkan'], 405);
    }
} catch (Exception $e) {
    error_log("Error in obat.php: " . $e->getMessage());
    sendResponse(['error' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
}

function handleGetObat() {
    global $conn;
    
    if (isset($_GET['id_obat'])) {
        $id = intval($_GET['id_obat']);
        $stmt = $conn->prepare("SELECT * FROM obat WHERE id_obat = ?");
        if (!$stmt) {
            throw new Exception('Prepare statement failed: ' . $conn->error);
        }
        $stmt->bind_param("i", $id);
    } else {
        $stmt = $conn->prepare("SELECT * FROM obat ORDER BY nama_obat");
        if (!$stmt) {
            throw new Exception('Prepare statement failed: ' . $conn->error);
        }
    }
    
    if (!$stmt->execute()) {
        throw new Exception('Query execution failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $obat = $result->fetch_all(MYSQLI_ASSOC);
    
    sendResponse($obat);
}

function handlePostObat() {
    global $conn;
    
    $input = getInput();
    
    // Validasi field required
    validateRequired($input, ['nama_obat']);
    
    // Prepare statement
    $stmt = $conn->prepare("INSERT INTO obat (nama_obat, jenis_obat, dosis, harga, stok, tanggal_kadaluarsa, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    
    // Handle data dengan default values
    $nama_obat = escape($input['nama_obat']);
    $jenis_obat = isset($input['jenis_obat']) ? escape($input['jenis_obat']) : null;
    $dosis = isset($input['dosis']) ? escape($input['dosis']) : null;
    $harga = isset($input['harga']) ? floatval($input['harga']) : 0.00;
    $stok = isset($input['stok']) ? intval($input['stok']) : 0;
    $tanggal_kadaluarsa = isset($input['tanggal_kadaluarsa']) ? escape($input['tanggal_kadaluarsa']) : null;
    $deskripsi = isset($input['deskripsi']) ? escape($input['deskripsi']) : null;
    
    // Bind parameters
    $stmt->bind_param("sssdiss", 
        $nama_obat, 
        $jenis_obat, 
        $dosis, 
        $harga, 
        $stok, 
        $tanggal_kadaluarsa, 
        $deskripsi
    );
    
    if ($stmt->execute()) {
        sendResponse([
            'success' => true,
            'message' => 'Obat berhasil ditambahkan', 
            'id' => $stmt->insert_id,
            'data' => [
                'nama_obat' => $nama_obat,
                'jenis_obat' => $jenis_obat,
                'dosis' => $dosis,
                'harga' => $harga,
                'stok' => $stok,
                'tanggal_kadaluarsa' => $tanggal_kadaluarsa,
                'deskripsi' => $deskripsi
            ]
        ], 201);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
}

function handlePutObat() {
    global $conn;
    
    $input = getInput();
    
    // Validasi field required
    validateRequired($input, ['id_obat', 'nama_obat']);
    
    $stmt = $conn->prepare("UPDATE obat SET nama_obat=?, jenis_obat=?, dosis=?, harga=?, stok=?, tanggal_kadaluarsa=?, deskripsi=? WHERE id_obat=?");
    
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    
    // Handle data
    $id_obat = intval($input['id_obat']);
    $nama_obat = escape($input['nama_obat']);
    $jenis_obat = isset($input['jenis_obat']) ? escape($input['jenis_obat']) : null;
    $dosis = isset($input['dosis']) ? escape($input['dosis']) : null;
    $harga = isset($input['harga']) ? floatval($input['harga']) : 0.00;
    $stok = isset($input['stok']) ? intval($input['stok']) : 0;
    $tanggal_kadaluarsa = isset($input['tanggal_kadaluarsa']) ? escape($input['tanggal_kadaluarsa']) : null;
    $deskripsi = isset($input['deskripsi']) ? escape($input['deskripsi']) : null;
    
    $stmt->bind_param("sssdissi", 
        $nama_obat, 
        $jenis_obat, 
        $dosis, 
        $harga, 
        $stok, 
        $tanggal_kadaluarsa, 
        $deskripsi,
        $id_obat
    );
    
    if ($stmt->execute()) {
        sendResponse([
            'success' => true,
            'message' => 'Obat berhasil diupdate'
        ]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
}

function handleDeleteObat() {
    global $conn;
    
    $input = getInput();
    
    // Validasi field required
    validateRequired($input, ['id_obat']);
    
    $stmt = $conn->prepare("DELETE FROM obat WHERE id_obat = ?");
    
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    
    $id_obat = intval($input['id_obat']);
    $stmt->bind_param("i", $id_obat);
    
    if ($stmt->execute()) {
        sendResponse([
            'success' => true,
            'message' => 'Obat berhasil dihapus'
        ]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
}
?>