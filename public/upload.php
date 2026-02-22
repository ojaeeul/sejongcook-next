<?php
/**
 * Sejong Baking Academy - Image Upload Handler
 * Handles file uploads from SunEditor, renames them to safe ASCII names, and saves them.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Configuration
$uploadDir = 'images/uploads/';
$allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$maxSize = 10 * 1024 * 1024; // 10MB

// Create directory if not exists
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Check for file upload
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'File upload failed or no file sent.']);
    exit;
}

$file = $_FILES['file'];
$fileName = $file['name'];
$fileTmp = $file['tmp_name'];
$fileSize = $file['size'];
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// Validate type
if (!in_array($fileExt, $allowedTypes)) {
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed.']);
    exit;
}

// Validate size
if ($fileSize > $maxSize) {
    echo json_encode(['error' => 'File too large. Max 10MB.']);
    exit;
}

// Generate Safe Name (Timestamp + Random)
$safeName = time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $fileExt;
$destination = $uploadDir . $safeName;

// Move file
if (move_uploaded_file($fileTmp, $destination)) {
    // Return success in SunEditor expected format
    // SunEditor expects: { "result": [ { "url": "...", "name": "...", "size": ... } ] }
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $fullUrl = $protocol . "://" . $host . "/" . $destination;

    // For local dev/port issues, relativity is often safer if on same domain
    $relativeUrl = "/" . $destination;

    echo json_encode([
        "result" => [
            [
                "url" => $relativeUrl,
                "name" => $fileName, // Keep original name for display if needed
                "size" => $fileSize
            ]
        ]
    ]);
} else {
    echo json_encode(['error' => 'Failed to save file. Permission denied?']);
}
?>