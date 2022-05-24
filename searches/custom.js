const Maximizer = require('../lib/maximizer');

const searchCustom = async (z, bundle) => {
  if (!bundle.inputData.name) {
    throw new Error('The name field is required.');
  }

  // We'll use the app name from package.json as the ApplicationId
  const appId = require('../package.json').name;
  // Build the search request
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

  // Search for the record in Maximizer
  const max = new Maximizer(z, bundle);
  const result = await max.sendMaximizerApiRequest('Read', request);

  // Make sure the record was created
  if (!(result.Custom || {}).Data) {
    throw new Error('The search failed.');
  }

  return result.Custom.Data;
};

module.exports = {
  key: 'custom',

  noun: 'Custom',
  display: {
    label: 'Search Custom Records',
    description: 'Searches for Custom records in Maximizer.',
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
