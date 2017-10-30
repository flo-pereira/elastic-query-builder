import deepmerge from './deepmerge';

const addTermQuery = (term, fields = ['id^5'], filters = []) => {
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
                and: [
                  ...filters,
                ],
              },
            },
          }],
        }
      }
    };
  }

  let filter = {};

  if (filters.length) {
    filter = {
      filter: {
        'bool': {
          'must': [{
            and: [
              ...filters,
            ],
          }],
        },
      }
    }
  }

  return {
    'query': {
      filtered: {
        'query': {
          'bool': {
            'should': [
              {
                'simple_query_string': {
                  'query': term,
                  'fields': [
                    '_all'
                  ],
                  'analyzer': 'standard'
                }
              },
              {
                'multi_match': {
                  'query': term,
                  'type': 'phrase_prefix',
                  fields
                }
              },
            ],
          }
        },
        ...filter,
      }
    }
  };
};

const addSuggestion = (term, field = 'id') => {

  if (!term || '' === term) {
    return {};
  }

  return {
    'suggest': {
      'text': term,
      'suggestions': {
        'phrase': {
          field,
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
  }
};

const addRangeAgg = (name, field, min, max, interval, filters = {}) => ({
  [name]: deepmerge({
    'filter': {
      'bool': {
        'must': [{
          'range': {
            [field]: {
              'gte': min,
              'lte': max,
            }
          }
        }]
      }
    },
    'aggs': {
      [name]: {
        'histogram': {
          field,
          interval,
          'min_doc_count': 0,
          'extended_bounds': {
            min,
            max,
          }
        }
      }
    }
  }, filters),
  [`more_than_${name}`]: deepmerge({
    'filter': {
      'bool': {
        'must': [{
          'range': {
            [field]: {
              'gt': max,
            }
          }
        }]
      }
    },
  }, filters),
});

const addTermAgg = (name, field, filters = {}, size = 50) => ({
  [name]: Object.assign({
    filter: {},
    aggs: {
      [name]: {
        terms: {
          field,
          size
        }
      },
      [`${name}_count`]: {
        cardinality: {
          field
        }
      }
    }
  }, filters),
});

const addDateFilter = (field, min, max) => {
  let bounds = {
    'from': `now+${min}d/d`,
  };

  if (null !== max) {
    bounds.to = `now+${max}d/d`;
  }

  return ({
    'date_range': {
      'field': field,
      'ranges': [
        bounds
      ]
    },
  });
};

const addRangeFilter = (field, min, max, type = 'ranges') => {

  if (type === 'date_range') {
    return addDateFilter(field, min, max);
  }

  let bounds = {
    'gte': min,
  };

  if (null !== max) {
    bounds.lte = max;
  }

  return ({
    'range': {
      [field]: bounds,
    },
  });
};

const addTermFilter = (field, term) => ({
  'term': {
    [field]: term,
  }
});

const addTermsFilter = (field, terms, verb = 'should') => {
  if (typeof terms === 'string') {
    return addTermFilter(field, terms);
  }

  return {
    'bool': {
      [verb]: terms.map((term) => addTermFilter(field, term)),
    }
  };
};

const setFilters = (filters = [], key = 'filter') => {

  if (!filters.length) {
    return {};
  }

  return {
    [key]: {
      'bool': {
        'must': filters,
      },
    },
  }
};

const addHighlight = (fields = ['id'], preTags = '>>>', postTags = '<<<') => ({
  highlight: {
    pre_tags: [preTags],
    post_tags: [postTags],
    fields: fields.reduce((result, item) => {
      result[item] = {};
      return result;
    }, {}),
  }
});

const sortBy = (field = '_score', order = 'desc') => ({ 'sort': [{ [field]: order }] });

export {
  addTermQuery,
  addSuggestion,
  addRangeFilter,
  addTermsFilter,
  setFilters,
  addRangeAgg,
  addTermAgg,
  addHighlight,
  sortBy,
};
