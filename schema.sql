CREATE TABLE users(
    user_id TEXT,
    device_id TEXT
);
CREATE TABLE reply_message_queue(
    device_id TEXT,
    message TEXT
);