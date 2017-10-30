'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortBy = exports.addHighlight = exports.addTermAgg = exports.addRangeAgg = exports.setFilters = exports.addTermsFilter = exports.addRangeFilter = exports.addSuggestion = exports.addTermQuery = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _deepmerge = require('./deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var addTermQuery = function addTermQuery(term) {
  var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['id^5'];
  var filters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (!term || '' === term) {
    if (!filters.length) {
      return {};
    }

    return {
      'query': {
        'bool': {
          'must': [{
            filtered: {
              filter: {
                and: [].concat(_toConsumableArray(filters))
              }
            }
          }]
        }
      }
    };
  }

  var filter = {};

  if (filters.length) {
    filter = {
      filter: {
        'bool': {
          'must': [{
            and: [].concat(_toConsumableArray(filters))
          }]
        }
      }
    };
  }

  return {
    'query': {
      filtered: _extends({
        'query': {
          'bool': {
            'should': [{
              'simple_query_string': {
                'query': term,
                'fields': ['_all'],
                'analyzer': 'standard'
              }
            }, {
              'multi_match': {
                'query': term,
                'type': 'phrase_prefix',
                fields: fields
              }
            }]
          }
        }
      }, filter)
    }
  };
};

var addSuggestion = function addSuggestion(term) {
  var field = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';


  if (!term || '' === term) {
    return {};
  }

  return {
    'suggest': {
      'text': term,
      'suggestions': {
        'phrase': {
          field: field,
          'real_word_error_likelihood': 0.95,
          'max_errors': 1,
          'gram_size': 4,
          'direct_generator': [{
            'field': '_all',
            'suggest_mode': 'always',
            'min_word_length': 1
          }]
        }
      }
    }
  };
};

var addRangeAgg = function addRangeAgg(name, field, min, max, interval) {
  var _ref;

  var filters = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  return _ref = {}, _defineProperty(_ref, name, (0, _deepmerge2.default)({
    'filter': {
      'bool': {
        'must': [{
          'range': _defineProperty({}, field, {
            'gte': min,
            'lte': max
          })
        }]
      }
    },
    'aggs': _defineProperty({}, name, {
      'histogram': {
        field: field,
        interval: interval,
        'min_doc_count': 0,
        'extended_bounds': {
          min: min,
          max: max
        }
      }
    })
  }, filters)), _defineProperty(_ref, 'more_than_' + name, (0, _deepmerge2.default)({
    'filter': {
      'bool': {
        'must': [{
          'range': _defineProperty({}, field, {
            'gt': max
          })
        }]
      }
    }
  }, filters)), _ref;
};

var addTermAgg = function addTermAgg(name, field) {
  var _aggs2;

  var filters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 50;
  return _defineProperty({}, name, Object.assign({
    filter: {},
    aggs: (_aggs2 = {}, _defineProperty(_aggs2, name, {
      terms: {
        field: field,
        size: size
      }
    }), _defineProperty(_aggs2, name + '_count', {
      cardinality: {
        field: field
      }
    }), _aggs2)
  }, filters));
};

var addDateFilter = function addDateFilter(field, min, max) {
  var bounds = {
    'from': 'now+' + min + 'd/d'
  };

  if (null !== max) {
    bounds.to = 'now+' + max + 'd/d';
  }

  return {
    'date_range': {
      'field': field,
      'ranges': [bounds]
    }
  };
};

var addRangeFilter = function addRangeFilter(field, min, max) {
  var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'ranges';


  if (type === 'date_range') {
    return addDateFilter(field, min, max);
  }

  var bounds = {
    'gte': min
  };

  if (null !== max) {
    bounds.lte = max;
  }

  return {
    'range': _defineProperty({}, field, bounds)
  };
};

var addTermFilter = function addTermFilter(field, term) {
  return {
    'term': _defineProperty({}, field, term)
  };
};

var addTermsFilter = function addTermsFilter(field, terms) {
  var verb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'should';

  if (typeof terms === 'string') {
    return addTermFilter(field, terms);
  }

  return {
    'bool': _defineProperty({}, verb, terms.map(function (term) {
      return addTermFilter(field, term);
    }))
  };
};

var setFilters = function setFilters() {
  var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'filter';


  if (!filters.length) {
    return {};
  }

  return _defineProperty({}, key, {
    'bool': {
      'must': filters
    }
  });
};

var addHighlight = function addHighlight() {
  var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['id'];
  var preTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '>>>';
  var postTags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '<<<';
  return {
    highlight: {
      pre_tags: [preTags],
      post_tags: [postTags],
      fields: fields.reduce(function (result, item) {
        result[item] = {};
        return result;
      }, {})
    }
  };
};

var sortBy = function sortBy() {
  var field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '_score';
  var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'desc';
  return { 'sort': [_defineProperty({}, field, order)] };
};

exports.addTermQuery = addTermQuery;
exports.addSuggestion = addSuggestion;
exports.addRangeFilter = addRangeFilter;
exports.addTermsFilter = addTermsFilter;
exports.setFilters = setFilters;
exports.addRangeAgg = addRangeAgg;
exports.addTermAgg = addTermAgg;
exports.addHighlight = addHighlight;
exports.sortBy = sortBy;