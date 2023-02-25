# express-passport-argon2-playground

大まかにどのような実装を加えれば認証機能を実現できるか知りたかったため書いてみました。

以下のライブラリを利用した認証の実装のデモです。

* express
* express-session
* passport
* passport-local
* argon2

## 使い方

### サーバーの起動

3000 番ポートにて listen します。

```shell
$ yarn install
$ node src/index.mjs
```

### ユーザーの作成

デフォルトで ID: alice, password: alice なユーザーが存在するため、ユーザー作成をせずにそれを用いても良いです。

```shell
$ curl -L -d 'username=admin' -d 'password=admin' -c cookies.txt -b cookies.txt localhost:3000/auth/signup
```

### ログイン

```shell
$ curl -L -d 'username=admin' -d 'password=admin' -c cookies.txt -b cookies.txt localhost:3000/auth/signin
```

自動的に `/user` にリダイレクトがかかり、認証できたユーザーの ID（autoincrement）と username が格納された JSON が帰ってきます（これがセッションから取得できるユーザー情報であり、この値から DB アクセスをしてもよい）。

### ログイン中のユーザーの情報を見る

```shell
$ curl -c cookies.txt -b cookies.txt localhost:3000/user
```

### ログアウト

```shell
$ curl -X POST -c cookies.txt -b cookies.txt localhost:3000/auth/logout
```

## 仕組み

SQLite3 でセッション用データベースとアプリケーション用データベースを分けて管理している。

passport と express-session の連携および SQLite3 を用いたセッションの永続化によって、クライアントは一度認証して得られたクッキーを使い回すことによってログイン中であることが要求されるエンドポイントを利用できるようになる。

各種エンドポイントを実装する際に、そのエンドポイントへアクセスしてくる人が認証している（すなわち、セッションが入ったクッキーをリクエストに乗せた状態である）ことを保証させることが可能となるので、ログイン中のユーザーに関する情報を返却するようなエンドポイントを作成することが可能となる。

sapakan/sapakan を実装する際には、セッションを永続化するためのデータベースには PostgreSQL を用いて良いと考えており、そのためのスキーマは `schema.prisma` で表現したい。