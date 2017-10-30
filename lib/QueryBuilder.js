'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _omit = require('ramda/src/omit');

var _omit2 = _interopRequireDefault(_omit);

var _template = require('./template');

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QueryBuilder = function () {
  function QueryBuilder() {
    var _this = this;

    _classCallCheck(this, QueryBuilder);

    this.query = {
      term: {
        term: null,
        fields: ['id^5']
      },
      filters: {
        ranges: {},
        terms: {}
      },
      aggs: {
        ranges: {},
        terms: {}
      },
      highlight: ['id'],
      sort: {
        field: '_score',
        order: 'desc'
      },
      size: 10,
      customFilters: {}
    };

    this.getTerm = function () {
      return _this.query.term.term;
    };

    this.getSort = function () {
      return _this.query.sort;
    };

    this.getQuery = function () {
      return _this.query;
    };
  }

  _createClass(QueryBuilder, [{
    key: 'getFilters',
    value: function getFilters() {
      var filters = {};

      for (var type in this.query.filters) {
        if (this.query.filters.hasOwnProperty(type)) {
          var filterType = this.query.filters[type];
          for (var filterKey in filterType) {
            if (filterType.hasOwnProperty(filterKey)) {
              var filter = filterType[filterKey];

              if ('ranges') {
                filters[filterKey] = {
                  type: type,
                  from: filter.from,
                  to: filter.to,
                  name: filterKey
                };

                continue;
              }

              if (type === 'terms') {
                filters[filterKey] = {
                  type: type,
                  term: filter.term,
                  name: filterKey
                };
              }
            }
          }
        }
      }

      for (var _filterKey in this.query.customFilters) {
        if (this.query.customFilters.hasOwnProperty(_filterKey)) {
          filters[_filterKey] = { type: 'custom', name: _filterKey, filter: _extends({}, this.query.customFilters[_filterKey]) };
        }
      }

      return filters;
    }
  }, {
    key: 'termQuery',
    value: function termQuery(term) {
      var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['id^5'];

      this.query.term.term = term;
      this.query.term.fields = fields;

      return this;
    }
  }, {
    key: 'rangeFilter',
    value: function rangeFilter(filter, from, to, field) {

      this.query.filters.ranges[filter] = { field: field, from: from, to: to };

      return this;
    }
  }, {
    key: 'removeFilter',
    value: function removeFilter(type, field) {
      try {
        if (field in this.query.filters[type]) {
          delete this.query.filters[type][field];

          return this;
        }
      } catch (e) {}

      try {
        if (field in this.query.customFilters) {
          delete this.query.customFilters[field];
        }
      } catch (e) {}

      return this;
    }
  }, {
    key: 'termFilter',
    value: function termFilter(filter, field, term) {

      if (!term.length) {
        return this.removeFilter('terms', field);
      }

      this.query.filters.terms[filter] = {
        field: field,
        term: term
      };

      return this;
    }
  }, {
    key: 'setCustomFilters',
    value: function setCustomFilters(key, filter) {
      this.query.customFilters[key] = filter;

      return this;
    }
  }, {
    key: 'aggRange',
    value: function aggRange(field, from, to, interval) {
      var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

      this.query.aggs.ranges[field] = { from: from, to: to, interval: interval, name: name };

      return this;
    }
  }, {
    key: 'aggTerm',
    value: function aggTerm(field) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this.query.aggs.terms[field] = { field: field, name: name };

      return this;
    }
  }, {
    key: 'setSize',
    value: function setSize() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

      this.query.size = size;

      return this;
    }
  }, {
    key: 'setHighlightFields',
    value: function setHighlightFields(fields) {
      if (!Array.isArray(fields)) {
        return this;
      }

      this.query.highlight = fields;

      return this;
    }
  }, {
    key: 'sortBy',
    value: function sortBy() {
      var field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '_score';
      var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'desc';

      this.query.sort = { field: field, order: order };

      return this;
    }
  }, {
    key: 'buildFilters',
    value: function buildFilters() {
      var must = {};

      for (var key in this.query.filters.ranges) {
        if (this.query.filters.ranges.hasOwnProperty(key)) {
          var range = this.query.filters.ranges[key];
          must['range_' + range.field] = (0, _template.addRangeFilter)(range.field, range.from, range.to, range.type);
        }
      }

      for (var _key in this.query.filters.terms) {
        if (this.query.filters.terms.hasOwnProperty(_key)) {
          var term = this.query.filters.terms[_key];
          must['term_' + term.field] = (0, _template.addTermsFilter)(term.field, term.term);
        }
      }

      return must;
    }
  }, {
    key: 'buildQuery',
    value: function buildQuery() {
      var must = this.buildFilters();
      var aggs = {};

      for (var key in this.query.aggs.ranges) {
        if (this.query.aggs.ranges.hasOwnProperty(key)) {
          var range = this.query.aggs.ranges[key];
          var name = range.name || 'agg_' + key;

          aggs = _extends({}, aggs, (0, _template.addRangeAgg)(name, key, range.from, range.to, range.interval, (0, _template.setFilters)(Object.values((0, _omit2.default)(['range_' + key], must)))));
        }
      }

      for (var _key2 in this.query.aggs.terms) {
        if (this.query.aggs.terms.hasOwnProperty(_key2)) {
          var term = this.query.aggs.terms[_key2];
          var _name = term.name || 'agg_' + _key2;

          aggs = _extends({}, aggs, (0, _template.addTermAgg)(_name, _key2, (0, _template.setFilters)(must)));
        }
      }

      return _extends({
        size: this.query.size
      }, (0, _template.addTermQuery)(this.query.term.term, this.query.term.fields, Object.values(this.query.customFilters)), !this.query.term.term || '' === this.query.term.term ? {} : (0, _template.addHighlight)(this.query.highlight, _.highlightPreTags, _.highlightPostTags), (0, _template.addSuggestion)(this.query.term.term), (0, _template.setFilters)(Object.values(must), 'post_filter'), (0, _template.sortBy)(this.query.sort.field, this.query.sort.order), {
        aggs: aggs
      });
    }
  }]);

  return QueryBuilder;
}();

exports.default = QueryBuilder;