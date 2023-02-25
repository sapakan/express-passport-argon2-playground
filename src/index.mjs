/// @ts-check

import express from 'express';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import passport from 'passport';
import { default as __sqliteStoreFactory } from 'express-session-sqlite';
import authRouter from './router/auth.mjs';
// @ts-ignore
const sqliteStoreFactory = __sqliteStoreFactory.default
console.log(sqliteStoreFactory);
const SqliteStore = sqliteStoreFactory(session);

/// ログイン済みでない場合は `/login` にリダイレクトする
const ensureLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next()
}

const app = express()
    // express-session によるセッション管理を有効化
    .use(session(
        {
            // TODO: 本来は環境変数から取得して指定したい
            secret: 'keyboard cat',
            // 変更が加わっていないセッションを再度保存しない
            resave: false,
            // 初期化されていないセッションを保存しない
            saveUninitialized: false,
            store: new SqliteStore({
                driver: sqlite3.Database,
                path: './var/db/sessions.db',
                /*
                 * セッションが生き残る時間（1 分）
                 * この時間を超えるとセッションは失効する
                 * TTL を超える前にセッション付きのリクエストが来ると TTL が更新される
                 */
                ttl: 1000 * 60,
            })
        }
    ))
    // passport による認証を有効化
    .use(passport.authenticate('session'))
    // `Content-Type: application/x-www-form-urlencoded` なリクエストで渡されるデータを解釈する
    .use(express.urlencoded({ extended: true }))
    // 認証関連のエンドポイントを有効化
    .use(authRouter)
    // `/user` に対するリクエストは認証を必要とする
    .get('/user', ensureLoggedIn, (req, res) => {
        // session に保持している、ログイン済みのユーザー情報を返す
        res.send(JSON.stringify(req.user));
    })
    .get('/login', (req, res) => {
        res.send('Login by sending a POST request to /auth/signin with username and password in the body');
    })

app.listen(3000, () => {
    console.log('Server started');
});