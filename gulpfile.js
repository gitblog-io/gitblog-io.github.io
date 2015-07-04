var BOWER_PATH, COFFEE_FILES, DEST_PATH, FILES, FRAMEWORK_FILES, JS_FILES, LESS_FILES, SRC_PATH, coffee, concat, gulp, less, path, plumber, rename, streamqueue, uglify;

concat = require("gulp-concat");
less = require("gulp-less");
plumber = require("gulp-plumber");
clean = require("gulp-clean");
gulp = require("gulp");
path = require("path");
streamqueue = require("streamqueue");
uglify = require("gulp-uglify");
rename = require("gulp-rename");

BOWER_PATH = "bower_components/";
SRC_PATH = "_src/";
DEST_PATH = "assets/";
LESS_FILES = [SRC_PATH + "/less/style.less"];
COFFEE_FILES = [SRC_PATH + "/js/app.js", 
                SRC_PATH + "/js/app.controllers.js", 
                SRC_PATH + "/js/app.directives.js", 
                SRC_PATH + "/js/app.services.js", 
                SRC_PATH + "/js/app.templates.js"];
FRAMEWORK_FILES = [BOWER_PATH + "/jquery/dist/jquery.js", BOWER_PATH + "/js-yaml/js-yaml.js", BOWER_PATH + "/ace-builds/src-noconflict/ace.js", BOWER_PATH + "/angular/angular.js", BOWER_PATH + "/angular-route/angular-route.js", BOWER_PATH + "/angular-cookies/angular-cookies.js", BOWER_PATH + "/angular-animate/angular-animate.js", BOWER_PATH + "/angularLocalStorage/src/angularLocalStorage.js", BOWER_PATH + "/angular-unsavedChanges/dist/unsavedChanges.js", BOWER_PATH + "/octokit/octokit.js", SRC_PATH + "/lib/mode-markdown.js", SRC_PATH + "/lib/ext-settings_menu.js", SRC_PATH + "/lib/theme-tomorrow-markdown.js", SRC_PATH + "/lib/filereader.js"];
JS_FILES = [DEST_PATH + "/js/*.js"];



gulp.task("css", function() {
  return gulp.src(LESS_FILES).pipe(plumber()).pipe(less({
    paths: [path.resolve(__dirname, SRC_PATH + "/less"), path.resolve(__dirname, BOWER_PATH + "/bootstrap/less")],
    compress: true
  })).pipe(gulp.dest(DEST_PATH + "/css"));
});

gulp.task("clean", function(){
  gulp.src(DEST_PATH + '/js/*.min.js').pipe(clean({}));
});

gulp.task("js", function() {
  gulp.src(COFFEE_FILES).pipe(concat("application.js")).pipe(gulp.dest(DEST_PATH + "/js"));
});

gulp.task("minify", function() {
  return gulp.src(JS_FILES)
  .pipe(plumber())
  .pipe(clean({}))
  .pipe(rename(function(path) {
    path.basename += ".min";
  }))
  .pipe(uglify({
    mangle: false
  }))
  .pipe(gulp.dest(DEST_PATH + "/js"));
});

gulp.task("watch", ["css", "js"], function() {
  gulp.watch(COFFEE_FILES, ["js"]);
  gulp.watch(FRAMEWORK_FILES, ["copy"]);
  return gulp.watch(SRC_PATH + "/less/*.less", ["css"]);
});

FILES = [SRC_PATH + "/img/*"];

gulp.task("copy", function() {
  gulp.src(FILES).pipe(gulp.dest(DEST_PATH + "/img"));
  gulp.src(FRAMEWORK_FILES).pipe(gulp.dest(DEST_PATH + "/js"))
  // return gulp.src(BOWER_PATH + "/ace-builds/src-min-noconflict/**/*.js").pipe(gulp.dest(DEST_PATH + "/js/ace/"));
});

gulp.task("default", ["clean","css", "js", "copy", "watch"]);

gulp.task("production", ["minify"]);