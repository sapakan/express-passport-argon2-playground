/// @ts-check

import sqlite3 from 'sqlite3';
import { generateHash } from './auth.mjs';

const userdb = new sqlite3.Database('./var/db/users.db');

export function initializeDatabase() {
    userdb.serialize(async () => {
        userdb.run(`
        create table if not exists users (
            id integer primary key autoincrement,
            username text unique,
            hashed_password blob
        )
        `)

        // 初期ユーザーを作成
        // alice / alice
        userdb.run(
            `
            insert or ignore into users (username, hashed_password)
            values (?, ?)
            `,
            [
                'alice',
                await generateHash('alice'),
            ]
        )
    })
}

export default userdb;