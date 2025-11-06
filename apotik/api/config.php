<?php
// api/config.php - VERSI FINAL

// Setting error reporting untuk development
error_reporting(E_ALL);
ini_set('display_errors', 0); // Non-aktifkan display error untuk production
ini_set('log_errors', 1);

// Set headers pertama kali
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight request untuk CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Konfigurasi database
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'apotik';

// Membuat koneksi
$conn = new mysqli($host, $username, $password, $database);

// Cek koneksi
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Koneksi database gagal: ' . $conn->connect_error]);
    exit;
}

// Set charset untuk menghindari issue encoding
$conn->set_charset('utf8mb4');

// Fungsi untuk mendapatkan data dari input
function getInput() {
    $input = file_get_contents('php://input');
    
    // Debug: log raw input (opsional)
    if (!empty($input)) {
        error_log("API Input: " . $input);
    }
    
    // Jika tidak ada input, return array kosong
    if (empty($input)) {
        return [];
    }
    
    $data = json_decode($input, true);
    
    // Validasi JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Data JSON tidak valid: ' . json_last_error_msg()]);
        exit;
    }
    
    return $data;
}

// Fungsi untuk merespon JSON
function sendResponse($data, $status_code = 200) {
    http_response_code($status_code);
    
    // Ensure data is array or object
    if (!is_array($data) && !is_object($data)) {
        $data = ['data' => $data];
    }
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Fungsi untuk escape string (security)
function escape($data) {
    global $conn;
    return $conn->real_escape_string(trim($data));
}

// Fungsi untuk validasi required fields
function validateRequired($data, $requiredFields) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '$field' harus diisi";
        }
    }
    
    if (!empty($errors)) {
        sendResponse(['error' => 'Validasi gagal', 'details' => $errors], 400);
    }
    
    return true;
}

// Auto close connection pada akhir script
register_shutdown_function(function() {
    global $conn;
    if ($conn) {
        $conn->close();
    }
});
?>