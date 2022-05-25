const Maximizer = require('../lib/maximizer');

/**
* This is the function that implements the main logic of our "Custom Trigger" action.
* The functionality is similar to that of the Custom Search action, and will be invoked
* by the Zapier platform at regular intervals (the duration depends on your Zapier plan)
* to poll the Maximizer.Web.Data API for new Custom records.
* @param {object} z The "z" object supplied by the Zapier platform. It includes
* methods for sending HTTP requests, and writing logs to the Zapier platform. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#z-object
* @param {object} bundle The "bundle" supplied by the Zapier platform. It includes
* authentication details as well as user input for the Zapier action. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#bundle-object
* @return {Array} An array of Custom objects returned by the polling search.
*/
const triggerCustom = async (z, bundle) => {
  // We'll use the app name from package.json as the ApplicationId for the Custom record.
  // This allows us to identify Custom records created by our app, and to differentiate them
  // from Custom records created by other apps and integrations. See:
  // https://developer.maximizer.com/doc/api-reference/custom
  const appId = require('../package.json').name;

  // Build the search request that we will send to
  // the Maximizer.Web.Data API to lookup custom records.
  // Note that in this example, we are searching for Custom records
  // with a matching ApplicationId, so we will only retrieve
  // Custom records created by our Zap App.
  // For information on constructing Maximizer.Web.Data API requests, see:
  // https://developer.maximizer.com/doc/api-reference/basic-request-syntax
  const request = {
    Custom: {
      Criteria: {
        SearchQuery: {
          ApplicationId: {
            '$EQ': appId,
          },
        },
      },
      Scope: {
        Fields: {
          Key: 1,
          Name: 1,
          Description: 1,
          Text1: 1,
          Number1: 1,
          Numeric1: 1,
          DateTime1: 1,
        },
      },
    },
  };

  // Create an instance of our helper class that we'll use to send the API request.
  const max = new Maximizer(z, bundle);

  // Send the "Read" request to the Maximizer.Web.Data API
  // to search for Custom records.
  const result = await max.sendMaximizerApiRequest('Read', request);

  // Make sure we got a valid response back (even if no records are found, we should
  // at least get an empty array back).
  if (!(result.Custom || {}).Data) {
    throw new Error('The search failed.');
  }

  // Map the Key to the 'id' property of the returned objects. This is required for
  // Zapier's polling deduper to work. For details on deduplication in Zapier triggers, see:
  // https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#how-does-deduplication-work
  return result.Custom.Data.filter((x) => x.Key).map((y) => {
    y.id = y.Key;
    return y;
  });
};

module.exports = {
  key: 'custom',

  noun: 'Custom',
  display: {
    label: 'New Custom Record',
    description: 'Triggers when a new Custom record is created in Maximizer (also known as CustomIndependent records).',
  },

  operation: {
    inputFields: [],

    perform: triggerCustom,

    sample: {
      Key: 'example key',
      ApplicationId: 'example appid',
      Name: 'example name',
      Description: 'example description',
      Text1: 'example text',
      Number1: 12345,
      Numeric1: 123.45,
      DateTime1: new Date(),
    },

    outputFields: [
      {key: 'Key', type: 'string', label: 'Custom Record Key'},
      {key: 'ApplicationId', type: 'string', label: 'Custom Record ApplicationId'},
      {key: 'Name', type: 'string', label: 'Custom Record Name'},
      {key: 'Description', type: 'text', label: 'Custom Record Description'},
      {key: 'Text1', type: 'text', label: 'Custom Record Text1'},
      {key: 'Number1', type: 'integer', label: 'Custom Record Number1'},
      {key: 'Numeric1', type: 'number', label: 'Custom Record Numeric1'},
      {key: 'DateTime1', type: 'datetime', label: 'Custom Record DateTime1'},
    ],
  },
};
