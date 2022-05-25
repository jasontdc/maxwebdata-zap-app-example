const Maximizer = require('../lib/maximizer');

/**
* This is the function that implements the main logic of our "Custom Search" action.
* @param {object} z The "z" object supplied by the Zapier platform. It includes
* methods for sending HTTP requests, and writing logs to the Zapier platform. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#z-object
* @param {object} bundle The "bundle" supplied by the Zapier platform. It includes
* authentication details as well as user input for the Zapier action. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#bundle-object
* @return {Array} An array of Custom objects returned by the search.
*/
const searchCustom = async (z, bundle) => {
  // Enforce mandatory fields
  if (!bundle.inputData.name) {
    throw new Error('The name field is required.');
  }

  // We'll use the app name from package.json as the ApplicationId for the Custom record.
  // This allows us to identify Custom records created by our app, and to differentiate them
  // from Custom records created by other apps and integrations. See:
  // https://developer.maximizer.com/doc/api-reference/custom
  const appId = require('../package.json').name;

  // Build the search request that we will send to
  // the Maximizer.Web.Data API to lookup custom records.
  // Note that in this example, in addition to searching by the Name
  // supplied by the user, we are also restricting the search to Custom
  // records with a matching ApplicationId, so we will only retrieve
  // Custom records created by our Zap App.
  // For information on constructing Maximizer.Web.Data API requests, see:
  // https://developer.maximizer.com/doc/api-reference/basic-request-syntax
  const request = {
    Custom: {
      Criteria: {
        SearchQuery: {
          '$AND': [
            {
              ApplicationId: {
                '$EQ': appId,
              },
            },
            {
              Name: {
                '$LIKE': bundle.inputData.name,
              },
            },
          ],
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

  // Return the array of Custom records that were returned by the search
  return result.Custom.Data;
};

module.exports = {
  key: 'custom',

  noun: 'Custom',
  display: {
    label: 'Search Custom Records',
    description: 'Searches for Custom records in Maximizer (also known as CustomIndependent records).',
  },

  operation: {
    inputFields: [
      {
        key: 'name',
        type: 'string',
        label: 'Name',
        required: true,
        helpText: 'The Name of the Custom record to search for (may include % wildcard).',
      },
    ],

    perform: searchCustom,

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
