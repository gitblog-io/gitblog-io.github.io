coffee = require "gulp-coffee"
concat = require "gulp-concat"
less = require "gulp-less"
plumber = require "gulp-plumber"
gulp = require "gulp"
path = require "path"
streamqueue = require "streamqueue"

BOWER_PATH = "bower_components/"
SRC_PATH = "_src/"
DEST_PATH = "assets/"

gulp.task "css", ->
  gulp.src "#{SRC_PATH}/less/style.less"
    .pipe plumber()
    .pipe less
      paths: [
        path.resolve(__dirname, "#{SRC_PATH}/less")
        path.resolve(__dirname, "#{BOWER_PATH}/bootstrap/less")
      ]
    .pipe gulp.dest("#{DEST_PATH}/css")


COFFEE_FILES = [
  "#{SRC_PATH}/coffee/app*.coffee"
]

JS_FILES = [
  "#{BOWER_PATH}/jquery/dist/jquery.js"
  "#{BOWER_PATH}/angular/angular.js"
  "#{BOWER_PATH}/angular-route/angular-route.js"
  "#{BOWER_PATH}/angular-cookies/angular-cookies.js"
  "#{BOWER_PATH}/angularLocalStorage/src/angularLocalStorage.js"
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
    .pipe gulp.dest("#{DEST_PATH}/js")

gulp.task "default", ["css", "js"]