import omit from 'ramda/src/omit';
import {
  addTermQuery,
  addSuggestion,
  addRangeFilter,
  addTermsFilter,
  setFilters,
  addRangeAgg,
  addTermAgg,
  addHighlight,
  sortBy,
} from './template';
import { highlightPreTags, highlightPostTags } from './';

class QueryBuilder {

  query = {
    term: {
      term: null,
      fields: ['id^5'],
    },
    filters: {
      ranges: {},
      terms: {},
    },
    aggs: {
      ranges: {},
      terms: {},
    },
    highlight: ['id'],
    sort: {
      field: '_score',
      order: 'desc',
    },
    size: 10,
    customFilters: {},
  };

  getTerm() {
    return this.query.term.term;
  }

  getFilters() {
    const filters = {};

    for (let type in this.query.filters) {
      if (this.query.filters.hasOwnProperty(type)) {
        let filterType = this.query.filters[type];
        for (let filterKey in filterType) {
          if (filterType.hasOwnProperty(filterKey)) {
            let filter = filterType[filterKey];

            if (type === 'ranges') {
              filters[filterKey] = {
                type,
                from: filter.from,
                to: filter.to,
                name: filterKey,
              };

              continue;
            }

            if (type === 'terms') {
              filters[filterKey] = {
                type,
                term: filter.term,
                name: filterKey,
              };
            }
          }
        }
      }
    }

    for (let filterKey in this.query.customFilters) {
      if (this.query.customFilters.hasOwnProperty(filterKey)) {
        filters[filterKey] = { type: 'exclude', name: filterKey };
      }
    }

    return filters;
  }

  getSort() {
    return this.query.sort;
  }

  termQuery(term, fields = ['id^5']) {
    this.query.term.term = term;
    this.query.term.fields = fields;

    return this;
  }

  rangeFilter(filter, from, to, field) {

    this.query.filters.ranges[filter] = { field, from, to };

    return this;
  }

  removeFilter(type, field) {
    try {
      delete this.query.filters[type][field];

      return this;
    } catch (e) {
    }

    try {
      delete this.query.customFilters[field];
    } catch (e) {
    }


    return this;
  }

  termFilter(filter, field, term) {

    if (!term.length) {
      return this.removeFilter('terms', field);
    }

    this.query.filters.terms[filter] = {
      field,
      term,
    };

    return this;
  }

  setCustomFilters(key, filter) {
    this.query.customFilters[key] = filter;

    return this;
  }

  aggRange(field, from, to, interval, name = null) {
    this.query.aggs.ranges[field] = { from, to, interval, name };

    return this;
  }

  aggTerm(field, name = null) {
    this.query.aggs.terms[field] = { field, name };

    return this;
  }

  getQuery() {
    return this.query;
  }

  setSize(size = 10) {
    this.query.size = size;

    return this;
  }

  setHighlightFields(fields) {
    if (!Array.isArray(fields)) {
      return this;
    }

    this.query.highlight = fields;

    return this;
  }

  sortBy(field = '_score', order = 'desc') {
    this.query.sort = { field, order };

    return this;
  }

  buildFilters() {
    let must = {};

    for (let key in this.query.filters.ranges) {
      if (this.query.filters.ranges.hasOwnProperty(key)) {
        let range = this.query.filters.ranges[key];
        must[`range_${range.field}`] = addRangeFilter(range.field, range.from, range.to);
      }
    }

    for (let key in this.query.filters.terms) {
      if (this.query.filters.terms.hasOwnProperty(key)) {
        let term = this.query.filters.terms[key];
        must[`term_${term.field}`] = addTermsFilter(term.field, term.term);
      }
    }

    return must;
  }

  buildQuery() {
    const must = this.buildFilters();
    let aggs = {};

    for (let key in this.query.aggs.ranges) {
      if (this.query.aggs.ranges.hasOwnProperty(key)) {
        let range = this.query.aggs.ranges[key];
        let name = range.name || `agg_${key}`;

        aggs = { ...aggs, ...addRangeAgg(name, key, range.from, range.to, range.interval, setFilters(Object.values(omit([`range_${key}`], must)))) };
      }
    }

    for (let key in this.query.aggs.terms) {
      if (this.query.aggs.terms.hasOwnProperty(key)) {
        let term = this.query.aggs.terms[key];
        let name = term.name || `agg_${key}`;

        aggs = { ...aggs, ...addTermAgg(name, key, setFilters(must)) };
      }
    }

    return {
      size: this.query.size,
      ...addTermQuery(this.query.term.term, this.query.term.fields, Object.values(this.query.customFilters)),
      ...(!this.query.term.term || '' === this.query.term.term) ? {} : addHighlight(this.query.highlight, highlightPreTags, highlightPostTags),
      ...addSuggestion(this.query.term.term),
      ...setFilters(Object.values(must), 'post_filter'),
      ...sortBy(this.query.sort.field, this.query.sort.order),
      aggs
    };
  }
}

export default QueryBuilder;
