'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (x, y) {
  return (0, _deepmerge2.default)(x, y, { arrayMerge: function arrayMerge(arrX, arrY) {
      return arrX.concat(arrY);
    } });
};