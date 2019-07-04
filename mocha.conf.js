const chai = require('chai');

// globalize sinon
global.sinon = require('sinon');

// initialize chai plugins
chai.use(require('sinon-chai'));
