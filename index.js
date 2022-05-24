const customCreate = require('./creates/custom');
const customSearch = require('./searches/custom');
const customTrigger = require('./triggers/custom');

const {
  config: authentication,
  befores = [],
  afters = [],
} = require('./authentication');

module.exports = {
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will need to know these before we can upload.
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [...befores],

  afterResponse: [...afters],

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [customTrigger.key]: customTrigger,
  },

  // If you want your searches to show up, you better include it here!
  searches: {
    [customSearch.key]: customSearch,
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [customCreate.key]: customCreate,
  },

  resources: {},
};
