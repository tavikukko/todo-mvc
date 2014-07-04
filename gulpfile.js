var gulp = require('gulp'); 

gulp.task('app', function() {
  var htmlSrc = './app/**/*.*',
      htmlDst = '/usr/local/openresty/nginx/html/app';
 
  gulp.src(htmlSrc)
    .pipe(gulp.dest(htmlDst));
});

gulp.task('conf', function() {
  var htmlSrc = './conf/**/*.*',
      htmlDst = '/usr/local/openresty/nginx/conf';
 
  gulp.src(htmlSrc)
    .pipe(gulp.dest(htmlDst));
});

gulp.task('lua', function() {
  var htmlSrc = './lua/**/*.*',
      htmlDst = '/usr/local/openresty/nginx/lua';
 
  gulp.src(htmlSrc)
    .pipe(gulp.dest(htmlDst));
});

// default gulp task
gulp.task('watchtask', ['conf', 'lua', 'app'], function() {
  gulp.watch('./app/**/*.*',['app']);
  gulp.watch('./conf/**/*.*',['conf']);
  gulp.watch('./lua/**/*.*',['lua']);
});