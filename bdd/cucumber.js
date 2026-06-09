'use strict';

module.exports = {
  default: {
    paths: ['../docs/features/**/*.feature'],
    require: ['./support/**/*.js', './step_definitions/**/*.js'],
    format: [
      'progress',
      'html:../reports/bdd-html/index.html',
    ],
    parallel: 1,
    timeout: 20000,
  },
};
