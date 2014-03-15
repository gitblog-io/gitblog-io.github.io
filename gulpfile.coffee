coffee = require "gulp-coffee"
concat = require "gulp-concat"
less = require "gulp-less"
plumber = require "gulp-plumber"
gulp = require "gulp"
path = require "path"

BOWER_PATH = "bower_components/"
SRC_PATH = "_src/"
DEST_PATH = "assets/"

gulp.task "less", ->
  gulp.src "#{SRC_PATH}/less/*.less"
    .pipe plumber()
    .pipe less
      paths: [
        path.resolve(__dirname, "#{SRC_PATH}/less")
        path.resolve(__dirname, "#{BOWER_PATH}/bootstrap/less")
      ]
    .pipe gulp.dest("#{DEST_PATH}/css")

gulp.task "default", ["less"]