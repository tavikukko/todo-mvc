
console.time("Loading plugins"); //start measuring
// include gulp
var gulp = require('gulp'); 
console.timeEnd("Loading plugins"); //end measuring

gulp.task('app', function() {
  var htmlSrc = './app/**/*.*',
      htmlDst = '/usr/local/openresty/nginx/html';
 
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
	gulp.watch('./app/**/*.*', function() {
    	gulp.run('app');
  });
	gulp.watch('./conf/**/*.*', function() {
    	gulp.run('conf');
  });
	gulp.watch('./lua/**/*.*', function() {
    	gulp.run('conf');
  });
});