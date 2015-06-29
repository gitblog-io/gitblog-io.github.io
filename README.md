Gitblog
==================

(www.gitblog.io)

Gitblog is a tool for programmers to post articles to github pages easily.

Functions:

- Switch between different user pages (orgs or other's user page)
- Add, edit and delete articles
- Upload images by paste or drag
- Swtich aritcle between `published` and  `draft`

Todo:

(https://github.com/gitblog-io/gitblog-io.github.io/issues/1)

Development Environment Setup
-------------------------------
1. Make sure *nodejs* and *npm* is installed.
2. Run

    ```bash
    npm install
    bower install
    ```
3. Install *Github-pages*

    ```bash
    sudo gem install github-pages
    ```
4. Make sure the following line is in your `/etc/hosts` file

    ```
    127.0.0.1 www.gitblog.io
    ```
5. Open a terminal, run

    ```
    npm start
    ```
6. Open another terminal, run

    ```
    sudo jekyll serve -w -P 80
    ```
7. Now you can have fun at `www.gitblog.io`
8. Before you send a PR, make sure build the project first.

    ```
    npm run build
    ```
