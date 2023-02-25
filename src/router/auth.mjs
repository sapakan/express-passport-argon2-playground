/// @ts-check

import userdb from "../userdb.mjs";

import passport from 'passport';
import { Strategy } from 'passport-local';
import express from 'express';
import { generateHash, verifyPassword } from "../auth.mjs";
const router = express.Router();

passport.use('local', new Strategy(
    async function(username, password, done) {
        const incorrectCredentialMessage = 'Incorrect username or password.';

        userdb.get(`
            select * from users where username = ?
        `, [username], async (err, row) => {
            if (err) {
                return done(err)
            }
            if (!row) {
                return done(null, false, { message: incorrectCredentialMessage } )
            }
            if (!await verifyPassword(row.hashed_password, password)) {
                return done(null, false, { message: incorrectCredentialMessage } )
            }
            return done(null, row)
        })
    }
));
// セッションでユーザー情報を保持するための serialization 方法を指定
passport.serializeUser(
    function(
        /** @type {import("../types").User} */
        user,
        done
    ) {
        done(null, { id: user.id, username: user.username });
    }
);
// セッションで保持されているユーザー情報から `req.user` に deserialize するための方法を指定
passport.deserializeUser(function(user, done) {
    // `req.user.username` に `username` が入る
    done(null, user);
});

router
    // ログインの処理を passport に委譲
    .post(
        '/auth/signin',
        // @ts-ignore
        passport.authenticate(
            'local',
            {
                successReturnToOrRedirect: '/user',
                failureRedirect: '/login',
                failureMessage: true,
            },
        )
    )
    // アカウント作成
    .post(
        '/auth/signup',
        async (req, res, next) => {
            const hash = await generateHash(req.body.password)
            userdb.run(
                `
                insert into users (username, hashed_password)
                values (?, ?)
                `,
                [
                    req.body.username,
                    hash,
                ], function(err) {
                    if (err) {
                        return next(err);
                    }
                    const user = {
                        id: this.lastID,
                        username: req.body.username,
                    };
                    req.login(user, err => {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/user');
                    });
                }
            )
        })
    // ログアウト
    .post('/auth/logout', (req, res, next) => {
        req.logout(err => {
            if (err) {
                return next(err);
            }
            res.redirect('/login');
        });
    });

export default router