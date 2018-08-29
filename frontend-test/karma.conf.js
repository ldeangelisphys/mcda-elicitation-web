'use strict';

const webpackConfig = require("../webpack.dev");
delete webpackConfig.entry;
webpackConfig.plugins = [];
webpackConfig.optimization = {
  splitChunks: false,
  runtimeChunk: false
};

module.exports = function(config) {
  config.set({
    
    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // plugins to load
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-junit-reporter',
      'karma-jasmine',
      'karma-webpack'
    ],
    preprocessors: {
      // add webpack as preprocessor
      'frontend-test/test-main.js': ['webpack']
    },

    webpack: webpackConfig,

    beforeMiddleware: ['webpackBlocker'],

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // 'frontend-test/unit/*Spec.js',
      'frontend-test/test-main.js',
      'app/js/misc.js',
      { pattern: 'app/js/**/*.js', included: false},
      { pattern: 'frontend-test/node_modules/**/*.js', included: false},
      { pattern: 'node_modules/**/*.js', included: false},
      { pattern: 'frontend-test/**/*.js', included: false}
    ],

    exclude: [
      'app/js/main.js',
      
    ],
    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'junit'],
    junitReporter: {
      outputFile: 'frontend-test/test-results.xml'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['ChromeHeadless'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 20000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
