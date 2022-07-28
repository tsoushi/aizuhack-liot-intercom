import sqlite3 from 'sqlite3';

const DATABASE_PATH = 'database.sqlite3';


export const initDatabase = () => {
    const db = new sqlite3.Database(DATABASE_PATH);
    const sqlQuery = fs.readFileSync('./schema.sql');
    db.run(sqlQuery.toString(), () => {
        db.close();
    });
}

export const addDeviceID = (userId, deviceId) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("insert into users values(?,?)", [userId, deviceId], () => {
        db.close();
    });
}

export const getUserIdFromDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_PATH);
        db.get("select * from users where device_id = ?", deviceId, (err, row) => {
            resolve(row["user_id"]);
            db.close();
        });
    });
}

export const removeDeviceID = (deviceId) => {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run("delete from users where device_id = ?", [deviceId], () => {
        db.close();
    });
}