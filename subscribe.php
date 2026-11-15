<?php
// LockedIn early-access signup handler.
// Saves valid, de-duplicated emails to data/signups.csv and optionally emails you.

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const NOTIFY_EMAIL = '';            // e.g. 'you@yourdomain.com' (leave empty to skip emails)
const DATA_DIR     = __DIR__ . '/data';
const CSV_FILE     = DATA_DIR . '/signups.csv';

function reply(bool $ok, string $message, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(false, 'Method not allowed.', 405);
}

// Honeypot: real people never fill this field, bots usually do.
if (!empty($_POST['website'])) {
    reply(true, 'Thanks, you’re on the list!');
}

$email = trim((string)($_POST['email'] ?? ''));
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(false, 'Please enter a valid email address.', 422);
}

$allowed = ['Social media', 'Videos', 'Games', 'Messaging', 'Something else', ''];
$distraction = (string)($_POST['distraction'] ?? '');
if (!in_array($distraction, $allowed, true)) {
    $distraction = '';
}

if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0750, true);
    file_put_contents(DATA_DIR . '/.htaccess', "Require all denied\nDeny from all\n");
}

$fh = fopen(CSV_FILE, 'c+');
if (!$fh) {
    reply(false, 'We couldn’t save your details. Please try again later.', 500);
}
flock($fh, LOCK_EX);

// Skip duplicates.
$exists = false;
while (($row = fgetcsv($fh)) !== false) {
    if (isset($row[1]) && strcasecmp($row[1], $email) === 0) { $exists = true; break; }
}

if (!$exists) {
    fseek($fh, 0, SEEK_END);
    fputcsv($fh, [date('c'), $email, $distraction]);
}
flock($fh, LOCK_UN);
fclose($fh);

if (!$exists && NOTIFY_EMAIL !== '') {
    $subject = 'New LockedIn signup';
    $body = "Email: $email\nDistraction: " . ($distraction ?: 'not given') . "\n";
    @mail(NOTIFY_EMAIL, $subject, $body, 'Content-Type: text/plain; charset=utf-8');
}

reply(true, 'Thanks, you’re on the list! We’ll be in touch.');
