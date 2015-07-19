# Eli

Eliは完全オレオレ仕様のフロントエンド開発用テンプレートです。

## About

このリポジトリは完全にオレオレ仕様の上に成り立ったフロントエンド開発用のテンプレートです。CSSに[Honoka](http://honokak.osaka/)を含んでいるので**ほのえり**です(重要)。

なおこのテンプレートの開発にはSANOGRAPHIXさんの[Rin](https://github.com/sanographix/rin)の影響を大いに受けています。


## Getting Started

### 1) Install Grunt

Eliは(今更)Gruntによる自動タスク処理を使用しています。Gruntを使うためには使用しているコンピュータに[Node.js](http://nodejs.org/)がインストールされている必要があります。

もしまだGruntをインストールしていない場合は以下のコマンドを実行して下さい。

```
% npm install -g grunt
```


### 2) Clone and NPM install

Eliのリポジトリをローカルにクローンし，NPMによって必要なパッケージをインストールします。

```
% git clone https://github.com/windyakin/Eli.git
% cd Eli
% npm install
```

やたらと大きなパッケージを多用しているためパッケージのインストールには若干の時間がかかります。


### 3) Git Submodule

以下のディレクトリついてはGitのSubmodule機能を使ってそれぞれのリポジトリのファイルを読み込んでいます。

 * ``src/boostrap/``
   * [twbs/bootstrap-sass](https://github.com/twbs/bootstrap-sass)
 * ``src/honoka/``
   * [windyakin/Honoka](https://github.com/windyakin/Honoka)

それぞれのフォルダに対してモジュールを読み込むために以下のコマンドを実行して下さい。

```
% git submodule update --init src/bootstrap
% git submodule update --init src/honoka
```


### 4) Compass

SassコードのコンパイルにCompassの機能の一部を使用しています。よってSassとは別にコンピュータへCompassがインストールされているする必要があります。

```
% gem install compass
```

### 5) Run Grunt

以下のコマンドを実行して，サーバが立ち上がればインストールは成功です。

```
% grunt server
```

ローカルサーバのURLは[http://127.0.0.1:8000/](http://127.0.0.1:8000/)です。


## Usage

### Test

```
grunt server
```

テスト用サーバを起動します。``localhost:8000``に接続することによって``dev/``ディレクトリの中身をプレビューできます(※``dist/``ではありません)。
また起動中に``src/``または``dev/``内のファイルが更新された場合，自動ビルドとLive Reloadが行われます。

### Build

```
grunt build
```

公開用にビルドを行います。同時に画像の圧縮やコードのminifyも行われます。ビルドで生成されたファイルは``dist/``内に生成されます。


## Development

### Directory

Eliのディレクトリ構成は以下のようになっています。

```
eli/
├─ dev/
│ ├─ assets/
│ └─ *.html
├─ dist/
└─ src/
    ├─ bootstrap/
    ├─ honoka/
    ├─ css/
    │ ├─ eli/
    │ │ └─ *.scss
    │ └─ *.scss
    ├─ img/
    └─ js/
       └─ *.js
```

``src/``以下では主にSCSS，JavaScript，画像のソースファイルを配置します。``dev/``フォルダにはhtmlファイルや``src/``内に入らないアセットファイル(動画・フォント)などを配置します。

### CSS

前述の通りCSSの開発にはSCSSを使用しています。``src/css/``以下に``.scss``として配置してください。またSASS版のBootstrap(Honoka)を読み込んでいるため，Bootstrapをそのまま使うことが出来ます。


### JavaScript

JavaScriptは``src/js/``以下に記述してください。``grunt server``タスク実行時はファイルはそのままコピーされ，ビルド時にのみminifyが行われます(ファイル名が``.min.js``などのファイルを除く)。


### Image

画像は``src/img/``以下に配置してください。これもビルド時にのみgrunt-imageによって圧縮が行われます。


### HTML

HTMLは``dev/``以下に直接配置してください。ビルド時にはそのままコピーされます。


## License

[MIT License](LICENSE)

## Author

 * windyakin ([windyakin.net](http://windyakin.net/))