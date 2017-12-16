# Eli

[![Build Status by Travis CI](https://travis-ci.org/windyakin/Eli.svg?branch=master)](https://travis-ci.org/windyakin/Eli)
[![Build status by AppVeyor](https://ci.appveyor.com/api/projects/status/6q4p7akb4v9u156n/branch/master?svg=true)](https://ci.appveyor.com/project/windyakin/eli/branch/master)
[![devDependency Status](https://david-dm.org/windyakin/Eli/dev-status.svg)](https://david-dm.org/windyakin/Eli#info=devDependencies)
[![The MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)


![eli](src/img/ogp.png)

Eliは完全オレオレ仕様のフロントエンド開発用テンプレートです。

## About

このリポジトリは完全にオレオレ仕様の上に成り立ったフロントエンド開発用のテンプレートです。CSSに[Honoka](http://honokak.osaka/)を含んでいるので**ほのえり**です(重要)。

なおこのテンプレートの開発にはSANOGRAPHIXさんの[Rin](https://github.com/sanographix/rin)の影響を大いに受けています。


## Getting started

ビルド環境を使用するためには以下のプログラムとライブラリが必要です。なお説明の際に記述しているバージョンはこのREADME.mdを執筆している時点(2017年12月)の安定版・最新版のバージョンです。

* Node.js
  * gulp

### Node.js 本体のインストール

* [Node.js](https://nodejs.org/en/) - v8.9.x

基本的にはNode.jsのページからインストーラーをダウンロードし、インストールすることで使用できるようになります。

#### 備考

Node.js はリリース間隔が非常に短いので、コアのバージョン管理が面倒な場合は [nodebrew](https://github.com/hokaccha/nodebrew) や [nodist](https://github.com/marcelklehr/nodist) などのバージョン管理ツールの導入も検討してください。

### Node.jsのパッケージのインストール

* [npm](https://www.npmjs.com/) - v5.5.1

Node.js のパッケージ管理には npm を使用します。npm 本体は Node.js をインストールした際に自動的に入っているはずなので、以下のコマンドで npm パッケージをインストールします。

```
% npm install
```

また、このコマンドで導入される npm パッケージの一覧は [package.json](package.json) を確認してください。


#### node_modules/.binにパスを通す

* [gulp.js](http://gulpjs.com/)

タスクランナーに gulp を使用しています。 `package.json` に開発依存パッケージとして記述してあるので、 `node_modules/.bin` 以下にインストールされます。 gulp を使った細かいタスクの動作を行いたい場合には、環境変数の `PATH` に `./node_modules/.bin` などを追加してパス指定なしで動かせるようにすると便利です。

ただし `npm run *` から Eli を操作する場合にはパスを通す作業を行わなくても構いません。


以上でビルド環境の準備は完了です。お疲れ様でした！


## Usage

### Directory

Eliの基本ディレクトリ構成は以下のようになっています。

```
eli/
├─ dev/
│   ├─ assets/
│   ├─ lib/
│   └─ *.html
├─ dist/
└─ src/
    ├─ honoka/
    ├─ scss/
    │   ├─ eli/
    │   │   └─ _variables.scss
    │   ├─ bootstrap.scss
    │   └─ default.scss
    ├─ img/
    └─ js/
         └─ *.js
```

#### src/

* アセット系のものを配置するディレクトリ
* `scss/` - SCSSとその設定ファイルなど
* `js/` - JavaScriptとその設定ファイルなど
* `img/` - 画像
* `lib/` - npm を使って入手できないコンポーネント

#### dev/

* ローカルテスト用のディレクトリ
* ローカル上で試すときはここをルートディレクトリにする
* HTMLやPHPなど、 `src/` に配置できないファイルは `dev/` 以下に配置する
* `dev/assets/` と `dev/lib/` は予約済みなので同名のフォルダを作り使うことはできない(後述)
  * Gitでファイル変更がトラックされない(.gitignore)
  * 開発タスクやビルドタスクを走らせると一度中身が全て消される
* `dev/assets/` の中身は **全て** `src/` からタスクランナーにより自動生成されるものとする
  * `dev/assets/` には `src/` から **minifyされていない** コードが生成される
* `dev/lib/` の中身は **全て** npm からインストールしたコンポーネント もしくは `src/lib/` の中身とする
  * 自作アイコンフォントなど、 npm を使って入手できないコンポーネントは `src/lib/` に入れる
  * `lib/` の中身は最適化やminifyなどは行わず、オリジナルからの単純なコピーとなる
  * npm と `src/lib/` で同名のフォルダ・ファイルがある場合、 `src/lib/` が優先される(上書きされる)

#### dist/

* ビルド生成された本番環境用のディレクトリ
* 公開にあたってはこの `dist/` 自体をルートディレクトリにする
* `dist/` の中身 **全て** が `src/` もしくは `dev/` から自動生成されるものとする
* ビルドタスクを走らせると一度中身が全て消され、それぞれコードを生成・コピーされる
* ファイル指定が面倒になるのでminifyしても `.min.{css,js}` などにせず、同一のファイル名にする
* `dist/assets/` には `src/` から **minifyされた** コードが生成される

### gulp task

#### Development (with test)

```
% npm run start
```
```
% gulp dev
```

* 開発用
* `dev/assets/` や `dev/lib/` 以下にファイルが出力される
* SCSSやJavaScriptのwatchタスクが走る
  * `src/` 内のファイルの変更があれば適宜ビルドタスクが走る
* `dev/` をドキュメントルートとした簡易サーバが走る
  * [http://localhost:8000/](http://localhost:8000/) からアクセスが可能
  * `dev/` 以下のファイルが更新された時、自動でリロードする

#### Distribute build

```
% npm run build
```
```
% gulp dist
```

* リリース用
* `dist/` 以下に最終ファイルを出力する
* `dist/assets/` 以下のファイルの最適化が行われる
* `% npm start` でも同様の結果が得られる

#### Sub tasks

メインのタスクを構成するサブタスクの説明

* `release`
  * 通常時に `dev/` に出力するフォルダを `dist/` に切り替える
  * 最初の子タスクに指定するとその後全てのタスクで有効
* `init`
  * 既に生成済みのなんやかんやを削除する
* `test`
  * Linterを走らせる
* `lib`
  * npm で指定しているコンポーネントをインストールして `{dev,dist}/lib/` に配置
  * `src/lib/` の内容を `{dev,dist}/lib/` にコピーする
* `optimize`
  * `assets/` 内のファイルをminifyしたり最適化したりする
* `build:css`
  * `src/scss/` 以下のSCSSをビルドし `{dev,dist}/assets/css/` に出力
  * ベンダープレフィックスを付与
  * プロパティの順序を並べかえる
  * linterによる構文チェックやminifyは行わない
* `build:js`
  * `src/js/` 以下のJavaScriptを `{dev,dist}/assets/js` にコピー
  * linterによる構文チェックやminifyは行わない
* `build:img`
  * `src/` 以下の画像ファイルを `{dev,dist}/assets/img` にコピー
  * 最適化は行わない
* `build`
  * 上記の `build-*` 系をまとめて処理


## License

[MIT License](LICENSE)


## Author

* windyakin ([windyakin.net](http://windyakin.net/))
