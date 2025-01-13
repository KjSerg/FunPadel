let mix = require('laravel-mix');
const autoprefixer = require('autoprefixer');
const resources = 'resources/';
const public = './';
mix.js('resources/js/app.js', 'js')
    .autoload({
        jquery: ['$', 'window.jQuery', 'jQuery']
    })
    .sass('resources/sass/app.scss', 'css', {
        sassOptions: {
            outputStyle: 'expanded'
        }
    }).options({
    postCss: [
        autoprefixer({
            overrideBrowserslist: ['last 6 versions'],
            grid: true
        }),
        require('cssnano')()
    ]
});
// if (mix.inProduction()) {
//     mix.version();
// }
mix.browserSync({
    proxy: false,
    server: {
        baseDir: public
    },
    files: [
        `${public}**/*`,
        `*.html`
    ]
});