/**
 * `req.user` に含まれるプロパティを定義する interface を拡張するための interface
 * TypeScript でコードを書いている場合は declare global で拡張すればよいが、
 * この playground では declare global が使えないので、ここで interface を定義して `@type` を使うときに参照している
 */ 
export interface User extends Express.User {
    /*
     * 本来ここの username の末尾には ? を付けたくないし、付けるのは実態から乖離しているが
     * 型エラーが出てしまうので妥協案として付けている
     * （TypeScript でコードを書いている場合は ? を付けないことが可能）
     */
    username?: string
    id?: number,
}