<?php
require_once 'config.php';

// Test semua fungsi config
sendResponse([
    'status' => 'success',
    'message' => 'Config berhasil di-load',
    'tests' => [
        'database_connection' => $conn->ping() ? 'connected' : 'disconnected',
        'database_name' => 'apotik',
        'server_time' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION
    ]
]);
?>