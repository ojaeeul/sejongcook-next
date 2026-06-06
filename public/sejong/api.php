<?php
/**
 * Sejong Baking Academy - PHP Data Bridge
 * Handles GET, POST, PUT, DELETE for JSON data files on Hostinger.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$board = $_GET['board'] ?? null;
if ($board) {
    if (strpos($board, '?') !== false) {
        $parts = explode('?', $board, 2);
        $board = $parts[0];
        parse_str($parts[1], $queryVars);
        $_GET = array_merge($queryVars, $_GET);
    }
    if (strpos($board, '&') !== false) {
        $parts = explode('&', $board, 2);
        $board = $parts[0];
        parse_str($parts[1], $queryVars);
        $_GET = array_merge($queryVars, $_GET);
    }
    $board = str_replace('sejong_/', 'sejong_', $board);
}

if (!$board) {
    http_response_code(400);
    echo json_encode(['error' => 'Board not specified']);
    exit;
}

// Map board names to file paths (relative to this script in public/)
$boardFiles = [
    'notice' => 'data/notice_data.json',
    'qna' => 'data/qna_data.json',
    'honor' => 'data/honor_data.json',
    'hero' => 'data/hero_data.json',
    'footer' => 'data/footer_data.json',
    'baking' => 'data/baking_posts.json',
    'cooking' => 'data/cooking_posts.json',
    'dessert' => 'data/dessert_posts.json',
    'cake' => 'data/cake_posts.json',
    'job-openings' => 'data/job_openings_data.json',
    'job-seekers' => 'data/job_seekers_data.json',
    'gallery' => 'data/gallery_data.json',
    'review' => 'data/review_data.json',
    'inquiry' => 'data/inquiries_data.json',
    'inquiries' => 'data/inquiries_data.json',
    'teachers' => 'data/teachers_data.json',
    'members' => 'data/members.json',
    'settings' => 'data/settings.json',
    'site-settings' => 'data/site_settings.json',
    'popups' => 'data/popups.json',
    'links' => 'data/sites_data.json',
    'schedule' => 'data/schedule_data.json',
    'timetable' => 'data/timetable_data.json',
    'visitors' => 'data/visitors.json',

    // Sejong Module endpoints
    'sejong_members' => 'data/sejong/members.json',
    'sejong_attendance' => 'data/sejong/attendance.json',
    'sejong_attendance/batch' => 'data/sejong/attendance.json',
    'sejong_holidays' => 'data/sejong/holidays.json',
    'sejong_payments' => 'data/sejong/payments.json',
    'sejong_settings' => 'data/sejong/settings.json',
    'sejong_timetable' => 'data/sejong/timetable_data.json',
    'sejong_sms_history' => 'data/sejong/sms_history.json'
];

if (!isset($boardFiles[$board])) {
    http_response_code(404);
    echo json_encode(['error' => 'Board mapping not found']);
    exit;
}

$filePath = dirname(__FILE__) . '/' . $boardFiles[$board];
$method = $_SERVER['REQUEST_METHOD'];

// Ensure directory exists
if (!file_exists(dirname($filePath))) {
    mkdir(dirname($filePath), 0755, true);
}

// Specialized Logic for sejong_attendance/batch (Monthly Attendance Checks)
if ($board === 'sejong_attendance/batch' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['memberId']) || !isset($input['dates']) || !is_array($input['dates'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }
    $memberId = $input['memberId'];
    $dates = $input['dates'];
    $status = $input['status'];
    $course = $input['course'] ?? null;

    $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if (!is_array($data))
        $data = [];

    $clearAllCourses = !array_key_exists('course', $input) || $input['course'] === null;

    $filtered = [];
    foreach ($data as $log) {
        $isMatchMemberAndDate = strval($log['memberId'] ?? '') === strval($memberId) && in_array($log['date'] ?? '', $dates);
        if ($isMatchMemberAndDate) {
            if ($clearAllCourses) {
                continue; // Drop everything for this member/date
            } else if (($log['course'] ?? null) === $course) {
                continue; // Drop specific course
            }
        }
        $filtered[] = $log;
    }

    if ($status !== 'unchecked') {
        foreach ($dates as $date) {
            $filtered[] = [
                'memberId' => $memberId,
                'date' => $date,
                'status' => $status,
                'course' => $course
            ];
        }
    }

    file_put_contents($filePath, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true]);
    exit;
}

// Specialized Logic for sejong_attendance (Single object POST)
if ($board === 'sejong_attendance' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    // If it's a full array replacement, let the generic list logic handle it
    if ($input && isset($input[0])) {
        // do nothing here, let it fall through
    } else if ($input && isset($input['memberId']) && isset($input['date'])) {
        $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
        if (!is_array($data)) $data = [];

        $memberId = $input['memberId'];
        $date = $input['date'];
        $course = $input['course'] ?? null;
        $status = $input['status'] ?? 'unchecked';

        $existing_idx = -1;
        foreach ($data as $i => $log) {
            if (strval($log['memberId'] ?? '') === strval($memberId) && ($log['date'] ?? '') === $date && ($log['course'] ?? null) === $course) {
                $existing_idx = $i;
                break;
            }
        }

        if ($existing_idx !== -1) {
            if ($status === 'unchecked') {
                array_splice($data, $existing_idx, 1);
            } else {
                $data[$existing_idx]['status'] = $status;
            }
        } else {
            if ($status !== 'unchecked') {
                $data[] = $input;
            }
        }

        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true]);
        exit;
    }
}


// Specialized Logic for sejong_payments (Upsert based on memberId, year, month, course)
if ($board === 'sejong_payments' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['memberId']) || !isset($input['year']) || !isset($input['month'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payment data']);
        exit;
    }
    
    $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if (!is_array($data)) $data = [];

    $normalizeCourse = function($c) {
        return (!$c || $c === 'null') ? null : trim((string)$c);
    };
    
    $courseToMatch = $normalizeCourse($input['course'] ?? null);

    $filtered = [];
    foreach ($data as $p) {
        if (strval($p['memberId'] ?? '') === strval($input['memberId']) &&
            strval($p['year'] ?? '') === strval($input['year']) &&
            strval($p['month'] ?? '') === strval($input['month']) &&
            $normalizeCourse($p['course'] ?? null) === $courseToMatch) {
            continue; // Remove existing
        }
        $filtered[] = $p;
    }
    
    $input['course'] = $courseToMatch;
    $filtered[] = $input; // Append new

    file_put_contents($filePath, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true]);
    exit;
}

// Specialized Logic for sejong_sms_history
if ($board === 'sejong_sms_history' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid sms data']);
        exit;
    }
    
    $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if (!is_array($data)) $data = [];
    
    $found = false;
    foreach ($data as &$entry) {
        if (($entry['date'] ?? '') === $input['date']) {
            if (!isset($entry['messages'])) {
                $entry['messages'] = [];
            }
            $entry['messages'] = array_merge($entry['messages'], $input['messages'] ?? []);
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        $data[] = [
            'date' => $input['date'],
            'messages' => $input['messages'] ?? []
        ];
    }
    
    file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true]);
    exit;
}

// Specialized Logic for Visitor Tracking
if ($board === 'visitors') {
    $currentDate = (new DateTime('now', new DateTimeZone('Asia/Seoul')))->format('Y. n. j.');

    // Read or default
    $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : null;
    if (!$data || !is_array($data)) {
        $data = [
            'date' => $currentDate,
            'today' => 0,
            'total' => 0
        ];
    }

    if ($method === 'GET') {
        if ($data['date'] !== $currentDate) {
            $data['date'] = $currentDate;
            $data['today'] = 0;
            file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        echo json_encode($data);
        exit;
    }

    if ($method === 'POST') {
        if ($data['date'] !== $currentDate) {
            $data['date'] = $currentDate;
            $data['today'] = 1;
            $data['total'] += 1;
        } else {
            $data['today'] += 1;
            $data['total'] += 1;
        }
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode($data);
        exit;
    }
}

// Boards that store a list of items vs single objects
$singleObjectBoards = ['hero', 'footer', 'settings', 'site-settings', 'schedule', 'timetable', 'sejong_settings'];
$isListBoard = !in_array($board, $singleObjectBoards);

switch ($method) {
    case 'GET':
        if (!file_exists($filePath)) {
            echo json_encode($isListBoard ? [] : new stdClass());
            exit;
        }
        echo file_get_contents($filePath);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit;
        }

        if ($isListBoard) {
            $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
            if (!is_array($data))
                $data = [];

            // If body is already an array, assume it's the full replacement
            if (isset($input[0])) {
                $data = $input;
            } else {
                // Generate ID if missing
                if (!isset($input['id'])) {
                    $input['id'] = time() . rand(100, 999);
                    $data[] = $input;
                } else {
                    // Check if it exists for upsert
                    $found = false;
                    foreach ($data as &$item) {
                        if (strval($item['id']) === strval($input['id'])) {
                            $item = array_merge($item, $input);
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        $data[] = $input;
                    }
                }
            }
            file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } else {
            file_put_contents($filePath, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        echo json_encode(['success' => true]);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit;
        }

        if ($isListBoard) {
            $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
            if (!is_array($data))
                $data = [];

            $id = $input['id'] ?? $_GET['id'] ?? null;
            if ($id) {
                $found = false;
                foreach ($data as &$item) {
                    if (strval($item['id']) === strval($id)) {
                        $item = array_merge($item, $input);
                        $found = true;
                        break;
                    }
                }
                if ($found) {
                    file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Item not found']);
                }
            } else {
                // Replace whole list if no ID provided but it's an array
                if (isset($input[0])) {
                    file_put_contents($filePath, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID required for update']);
                }
            }
        } else {
            file_put_contents($filePath, json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode(['success' => true]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id || !$isListBoard) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required for deletion']);
            exit;
        }

        $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
        if (!is_array($data)) {
            echo json_encode(['success' => true, 'message' => 'No data to delete']);
            exit;
        }

        $filtered = array_filter($data, function ($item) use ($id) {
            return strval($item['id'] ?? '') !== strval($id);
        });

        file_put_contents($filePath, json_encode(array_values($filtered), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
