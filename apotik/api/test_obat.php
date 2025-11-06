<?php
// test_obat.php - File test sederhana
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'Test API berhasil',
    'data' => [
        'test' => 'OK',
        'time' => date('Y-m-d H:i:s')
    ]
];

echo json_encode($response);
?>