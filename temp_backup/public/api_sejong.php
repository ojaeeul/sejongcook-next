<?php
/**
 * Sejong-specific API endpoints for Hostinger deployment
 * Handles attendance, holidays, timetable, and members data
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$dataDir = dirname(__FILE__) . '/data/sejong/';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

function readJsonFile($path)
{
    if (!file_exists($path)) {
        return [];
    }
    $content = file_get_contents($path);
    return json_decode($content, true) ?: [];
}

function writeJsonFile($path, $data)
{
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

switch ($action) {
    case 'members':
        $file = $dataDir . 'members.json';
        if ($method === 'GET') {
            echo file_get_contents($file);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $members = readJsonFile($file);

            if (!isset($input['id'])) {
                $input['id'] = (string) (time() * 1000);
            }
            if (!isset($input['registeredDate'])) {
                $input['registeredDate'] = date('Y-m-d');
            }

            $found = false;
            foreach ($members as &$m) {
                if ($m['id'] === $input['id']) {
                    $m = $input;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $members[] = $input;
            }

            writeJsonFile($file, $members);
            echo json_encode(['success' => true, 'data' => $input]);
        } elseif ($method === 'DELETE') {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing member ID']);
                exit;
            }

            $members = readJsonFile($file);
            $members = array_filter($members, function ($m) use ($id) {
                return $m['id'] !== $id;
            });

            writeJsonFile($file, array_values($members));
            echo json_encode(['success' => true]);
        }
        break;

    case 'attendance':
        $file = $dataDir . 'attendance.json';
        if ($method === 'GET') {
            echo file_get_contents($file);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $attendance = readJsonFile($file);

            // Find and update or add
            $found = false;
            foreach ($attendance as &$a) {
                if (
                    $a['memberId'] === $input['memberId'] &&
                    $a['date'] === $input['date'] &&
                    ($a['course'] ?? null) === ($input['course'] ?? null)
                ) {
                    $a = $input;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $attendance[] = $input;
            }

            writeJsonFile($file, $attendance);
            echo json_encode(['success' => true]);
        }
        break;

    case 'attendance_batch':
        $file = $dataDir . 'attendance.json';
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $attendance = readJsonFile($file);

            $memberId = $input['memberId'];
            $dates = $input['dates'];
            $status = $input['status'];
            $course = $input['course'] ?? null;

            foreach ($dates as $date) {
                $found = false;
                foreach ($attendance as &$a) {
                    if (
                        $a['memberId'] === $memberId &&
                        $a['date'] === $date &&
                        ($a['course'] ?? null) === $course
                    ) {
                        $a['status'] = $status;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $attendance[] = [
                        'memberId' => $memberId,
                        'date' => $date,
                        'status' => $status,
                        'course' => $course
                    ];
                }
            }

            writeJsonFile($file, $attendance);
            echo json_encode(['success' => true]);
        }
        break;

    case 'holidays':
        $file = $dataDir . 'holidays.json';
        if ($method === 'GET') {
            echo file_get_contents($file);
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $holidays = readJsonFile($file);

            $date = $input['date'];
            $isHoliday = $input['isHoliday'];

            if ($isHoliday) {
                $found = false;
                foreach ($holidays as $h) {
                    if ($h['date'] === $date) {
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $holidays[] = ['date' => $date];
                }
            } else {
                $holidays = array_filter($holidays, function ($h) use ($date) {
                    return $h['date'] !== $date;
                });
                $holidays = array_values($holidays);
            }

            writeJsonFile($file, $holidays);
            echo json_encode(['success' => true]);
        }
        break;

    case 'timetable':
        $file = $dataDir . 'timetable_data.json';
        if ($method === 'GET') {
            if (file_exists($file)) {
                echo file_get_contents($file);
            } else {
                echo json_encode(new stdClass());
            }
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
