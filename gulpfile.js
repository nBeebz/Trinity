var gulp            = require("gulp"),
  include           = require("gulp-include"),
  image             = require('gulp-image'),
  webserver         = require('gulp-webserver'),
  docs              = require('gulp-documentation');

gulp.task("document", function(){
  console.log("-- building documentation");
  return gulp.src('src/trinity/*.js')
  .pipe(docs('md'))
  .pipe(gulp.dest('build/docs/markdown'));
});

gulp.task("scripts", function() {
  console.log("-- building scripts");
  gulp.src("src/game.js")
  .pipe(include())
    .on('error', console.log)
  .pipe(gulp.dest("build"));
});


gulp.task("images", function() {
  console.log("-- building images");
  gulp.src("src/assets/textures/*")
  .pipe(image())
    .on('error', console.log)
  .pipe(gulp.dest("build/textures"));
});

gulp.task("models", function(){
  console.log("-- Building models");
  gulp.src("src/assets/models/**/*")
  .pipe(gulp.dest("build/models"));
});

gulp.task("audio", function(){
  console.log("-- Building audio files");
  gulp.src("src/assets/sound/**/*")
  .pipe(gulp.dest("build/sound"));
});

gulp.task("watch", function(){
  console.log("-- watching source files...");
  gulp.watch("src/*.js", ["scripts"])
    .on('error', console.log);
  gulp.watch("src/engine/*.js", ["scripts"])
    .on('error', console.log);
  gulp.watch("src/textures/*", ["images"])
    .on('error', console.log);
});

gulp.task("server", function(){
  gulp.src("build")
    .pipe(webserver({
      livereload: true,
      open: true
    }))
    .on('error', console.log);
});

gulp.task("default", ["scripts", "images", "models", "audio", "server", "document", "watch"]);
