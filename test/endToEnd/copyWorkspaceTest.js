'use strict';

const loginService = require('./util/loginService.js');
const workspaceService = require('./util/workspaceService.js');
const errorService = require('./util/errorService');

module.exports = {
  'Copy a workspace': function(browser) {
    const title = 'Antidepressants - single study B/R analysis (Tervonen et al, Stat Med, 2011)';
    const newTitle = 'copy of a workspace';

    loginService.login(browser);
    workspaceService.addExample(browser, title);
    workspaceService.copy(browser, 0, newTitle);
    workspaceService.deleteFromList(browser, 1);
    workspaceService.deleteFromList(browser, 0);
    errorService.isErrorBarHidden(browser).end();
  }
};
