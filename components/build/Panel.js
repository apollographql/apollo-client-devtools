'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _Explorer = require('./Explorer');

var _Explorer2 = _interopRequireDefault(_Explorer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _reactDom.render)(_react2.default.createElement(_Explorer2.default, null), document.getElementsByTagName('body')[0]); // This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension