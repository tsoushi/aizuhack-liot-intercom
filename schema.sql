CREATE TABLE IF NOT EXISTS users(
    user_id TEXT,
    device_id TEXT
);
CREATE TABLE IF NOT EXISTS reply_message_queue(
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    device_id TEXT,
    message TEXT
);
CREATE TABLE IF NOT EXISTS context(
    user_id TEXT,
    context TEXT
);
CREATE TABLE IF NOT EXISTS visitor_images(
    device_id TEXT,
    created_at TEXT,
    image_url TEXT
);