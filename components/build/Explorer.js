'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _graphiql = require('graphiql');

var _graphiql2 = _interopRequireDefault(_graphiql);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

chrome.devtools.inspectedWindow.eval('window.__APOLLO_CLIENT__.makeGraphiqlQuery = (payload, noFetch) => {\n  if (noFetch) {\n    return window.__APOLLO_CLIENT__.query({\n      query: payload.query,\n      variables: payload.variables,\n      nofetch: true,\n    }).catch(e => ({\n      errors: e.graphQLErrors,\n    }));\n  }\n  return window.__APOLLO_CLIENT__.networkInterface.query(payload);\n};', function (result, isException) {});

var id = 0;
var createPromise = function createPromise(code) {
  return new Promise(function (resolve, reject) {
    var currId = id;id++;

    var promiseCode = '\n    (function() {\n      window.__chromePromises = window.__chromePromises || {};\n      var p = (' + code + ')\n\n      p.then(function(r) {\n        window.__chromePromises[' + currId + '] = { result: r };\n      }).catch(function (e) {\n        window.__chromePromises[' + currId + '] = { error: e };\n      });\n    })()\n    ';

    chrome.devtools.inspectedWindow.eval(promiseCode, function (result, isException) {
      console.warn('isException1', isException);
    });

    var pollCode = '\n      (function () {\n        var result = window.__chromePromises[' + currId + '];\n        if (result) {\n          delete window.__chromePromises[' + currId + '];\n        }\n        return result;\n      })()\n    ';

    var poll = function poll() {
      setTimeout(function () {
        chrome.devtools.inspectedWindow.eval(pollCode, function (result, isException) {
          if (!result) {
            poll();
          } else if (result.result) {
            resolve(result.result);
          } else {
            reject(result.error);
          }
        });
      }, 100);
    };
    poll();
  });
};

var Explorer = function (_Component) {
  _inherits(Explorer, _Component);

  function Explorer(props, context) {
    _classCallCheck(this, Explorer);

    var _this = _possibleConstructorReturn(this, (Explorer.__proto__ || Object.getPrototypeOf(Explorer)).call(this, props, context));

    _this.state = {
      forceFetch: false,
      noFetch: false,
      notifyOnNetworkStatusChange: false
    };

    _this.graphQLFetcher = function (graphQLParams) {
      var client = _this.props.client;
      var noFetch = _this.state.noFetch;


      return createPromise("window.__APOLLO_CLIENT__.makeGraphiqlQuery(" + JSON.stringify({
        query: (0, _graphql.parse)(graphQLParams.query),
        variables: graphQLParams.variables
      }) + ", " + noFetch + ")");
    };
    return _this;
  }

  _createClass(Explorer, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var noFetch = this.state.noFetch;

      return _react2.default.createElement(
        'div',
        { className: 'ac-graphiql' },
        _react2.default.createElement(
          _graphiql2.default,
          { fetcher: this.graphQLFetcher },
          _react2.default.createElement(
            _graphiql2.default.Logo,
            null,
            'Custom Logo'
          ),
          _react2.default.createElement(
            _graphiql2.default.Toolbar,
            null,
            _react2.default.createElement(
              'button',
              {
                name: 'NoFetchButton',
                className: (noFetch ? 'active ' : '') + 'no-fetch-button',
                onClick: function onClick() {
                  _this2.setState({ noFetch: !noFetch });
                }
              },
              'Local'
            )
          )
        )
      );
    }
  }]);

  return Explorer;
}(_react.Component);

exports.default = Explorer;