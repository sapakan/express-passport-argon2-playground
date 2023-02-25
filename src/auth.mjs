/// @ts-check
import argon2 from 'argon2';

/**
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 * @param {string} password 
 * @returns Argon2id で生成したハッシュ
 */
export function generateHash(password) {
    return argon2.hash(
        password,
        {
            type: argon2.argon2id,
            memoryCost: 19 * 1024,
            timeCost: 2,
            parallelism: 1,
        }
    );
}

/**
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 * @param {string} hash 
 * @param {string} password 
 * @returns パスワードとハッシュが一致するかどうか
 */
export function verifyPassword(hash, password) {
    return argon2.verify(
        hash,
        password,
        {
            type: argon2.argon2id,
            memoryCost: 19 * 1024,
            timeCost: 2,
            parallelism: 1,
        }
    );
}