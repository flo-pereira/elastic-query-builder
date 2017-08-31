'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.highlightPostTags = exports.highlightPreTags = exports.template = exports.deepmerge = exports.QueryBuilder = undefined;

var _QueryBuilder = require('./QueryBuilder');

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

var _deepmerge = require('./deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QueryBuilder = new _QueryBuilder2.default();

var highlightPreTags = '>>>';
var highlightPostTags = '<<<';

exports.QueryBuilder = QueryBuilder;
exports.deepmerge = _deepmerge2.default;
exports.template = _template2.default;
exports.highlightPreTags = highlightPreTags;
exports.highlightPostTags = highlightPostTags;
exports.default = QueryBuilder;