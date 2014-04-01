coffee = require "gulp-coffee"
concat = require "gulp-concat"
less = require "gulp-less"
plumber = require "gulp-plumber"
gulp = require "gulp"
path = require "path"
streamqueue = require "streamqueue"
uglify = require "gulp-uglify"

BOWER_PATH = "bower_components/"
SRC_PATH = "_src/"
DEST_PATH = "assets/"

LESS_FILES = [
  "#{SRC_PATH}/less/style.less"
]

gulp.task "css", ->
  gulp.src LESS_FILES
    .pipe plumber()
    .pipe less
      paths: [
        path.resolve(__dirname, "#{SRC_PATH}/less")
        path.resolve(__dirname, "#{BOWER_PATH}/bootstrap/less")
      ]
      compress: true
    .pipe gulp.dest("#{DEST_PATH}/css")


COFFEE_FILES = [
  "#{SRC_PATH}/coffee/octokit*.coffee"
  "#{SRC_PATH}/coffee/app*.coffee"
]

JS_FILES = [
  "#{BOWER_PATH}/lodash/dist/lodash.underscore.js"
  "#{BOWER_PATH}/jquery/dist/jquery.js"
  "#{BOWER_PATH}/angular/angular.js"
  "#{BOWER_PATH}/angular-route/angular-route.js"
  "#{BOWER_PATH}/angular-cookies/angular-cookies.js"
  "#{BOWER_PATH}/angularLocalStorage/src/angularLocalStorage.js"
  # "#{BOWER_PATH}/octokit/octokit.js"
  "#{BOWER_PATH}/js-yaml/js-yaml.js"
  "#{BOWER_PATH}/ace-builds/src-noconflict/ace.js"
  "#{SRC_PATH}/js/mode-markdown-custom.js"
  "#{SRC_PATH}/js/filereader.js"
  "#{BOWER_PATH}/ace-builds/src-noconflict/theme-tomorrow.js"
]

gulp.task "js", ->
  appQueue = streamqueue(objectMode: true)
  appQueue.queue(
    gulp.src JS_FILES
  )

  appQueue.queue(
    gulp.src COFFEE_FILES
      .pipe plumber()
      .pipe coffee bare:true
  )

  appQueue.done()
    .pipe plumber()
    .pipe concat "application.js"
    .pipe uglify()
    .pipe gulp.dest("#{DEST_PATH}/js")

gulp.task "watch", ["css", "js"], ->
  gulp.watch COFFEE_FILES, ["js"]
  gulp.watch "#{SRC_PATH}/less/*.less", ["css"]

FILES =[
  "#{SRC_PATH}/img/*"
]

gulp.task "copy", ->
  gulp.src FILES
    .pipe gulp.dest("#{DEST_PATH}/img")

gulp.task "default", ["css", "js", "copy", "watch"]