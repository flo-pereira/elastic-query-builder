import { default as QB } from './QueryBuilder';
import deepmerge from './deepmerge';
import template from './template';

const QueryBuilder = new QB();

const highlightPreTags = '>>>';
const highlightPostTags = '<<<';

export {
  QueryBuilder,
  deepmerge,
  template,
  highlightPreTags,
  highlightPostTags,
};

export default QueryBuilder;