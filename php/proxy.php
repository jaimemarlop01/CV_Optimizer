<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$body    = file_get_contents('php://input');
$payload = json_decode($body, true);

if (!$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload inválido']);
    exit;
}

$anthropicPayload = [
    'model'      => 'claude-sonnet-4-5',
    'max_tokens' => $payload['max_tokens'] ?? 1500,
    'system'     => $payload['system'] ?? '',
    'messages'   => $payload['messages'] ?? [],
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_POSTFIELDS     => json_encode($anthropicPayload),
    CURLOPT_TIMEOUT        => 60,
]);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    echo json_encode(['error' => 'Error de conexión: ' . $curlError]);
    exit;
}

if ($httpCode !== 200) {
    $errData = json_decode($response, true);
    $errMsg  = $errData['error']['message'] ?? ('HTTP ' . $httpCode);
    http_response_code($httpCode);
    echo json_encode(['error' => $errMsg]);
    exit;
}

// La respuesta de Anthropic ya tiene el formato que espera el frontend
echo $response;
