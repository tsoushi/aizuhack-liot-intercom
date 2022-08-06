CREATE TABLE IF NOT EXISTS users(
    user_id TEXT UNIQUE,
    device_id TEXT
);
CREATE TABLE IF NOT EXISTS reply_message_queue(
    id INTEGER PRIMARY KEY,
    device_id TEXT,
    message TEXT
);