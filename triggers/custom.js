const Maximizer = require('../lib/maximizer');

const triggerCustom = async (z, bundle) => {
  // We'll use the app name from package.json as the ApplicationId
  const appId = require('../package.json').name;
  // Retrieve any new Custom records created for this appid
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

  // Search for new records in Maximizer
  const max = new Maximizer(z, bundle);
  const result = await max.sendMaximizerApiRequest('Read', request);

  // Make sure the search returns successfully
  if (!(result.Custom || {}).Data) {
    throw new Error('The search failed.');
  }

  // Map the Key to the 'id' property of the returned objects
  // This is required for Zapier's polling deduper to work correctly
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
    description: 'Triggers when a new Custom record is created in Maximizer.',
  },

  operation: {
    inputFields: [],

    perform: triggerCustom,

    sample: {
      Key: 'key',
      ApplicationId: 'appid',
      Name: 'name',
      Description: 'description',
      Text1: 'text',
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
