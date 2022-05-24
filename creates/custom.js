const Maximizer = require('../lib/maximizer');

// Send the email via the Maximizer API
const createCustom = async (z, bundle) => {
  if (!bundle.inputData.name) {
    throw new Error('The name field is required.');
  }

  // We'll use the app name from package.json as the ApplicationId
  const appId = require('../package.json').name;
  // Build the Custom object
  const request = {
    Custom: {
      Data: {
        Key: null,
        ApplicationId: appId,
        Name: bundle.inputData.name,
      },
    },
  };

  // Add the optional fields, if supplied
  if (bundle.inputData.description) {
    request.Custom.Data['Description'] = bundle.inputData.description;
  }
  // Add the optional fields, if supplied
  if (bundle.inputData.text1) {
    request.Custom.Data['Text1'] = bundle.inputData.text1;
  }
  // Add the optional fields, if supplied
  if (bundle.inputData.number1) {
    request.Custom.Data['Number1'] = bundle.inputData.number1;
  }
  // Add the optional fields, if supplied
  if (bundle.inputData.numeric1) {
    request.Custom.Data['Numeric1'] = bundle.inputData.numeric1;
  }
  // Add the optional fields, if supplied
  if (bundle.inputData.datetime1) {
    request.Custom.Data['DateTime1'] = bundle.inputData.datetime1;
  }

  // Create the record in Maximizer
  const max = new Maximizer(z, bundle);
  const result = await max.sendMaximizerApiRequest('Create', request);

  // Make sure the record was created
  if (!(result.Custom || {}).Data) {
    throw new Error('Unable to create the Custom record.');
  }

  return result.Custom.Data;
};

module.exports = {
  key: 'custom',

  noun: 'Custom',
  display: {
    label: 'Create Custom Record',
    description: 'Creates a new Custom record in Maximizer.',
  },

  operation: {
    inputFields: [
      {
        key: 'name',
        label: 'Name',
        required: true,
        type: 'string',
        helpText: 'The name of the Custom record to be saved.',
      },
      {
        key: 'description',
        label: 'Description',
        required: false,
        type: 'text',
        helpText: 'The description of the Custom record to be saved.',
      },
      {
        key: 'text1',
        label: 'Text 1',
        required: false,
        type: 'text',
        helpText: 'A text value to save with the Custom record to be saved.',
      },
      {
        key: 'number1',
        label: 'Number1',
        required: false,
        type: 'integer',
        helpText: 'An integer value to save with the Custom record to be saved.',
      },
      {
        key: 'numeric1',
        label: 'Numeric1',
        required: false,
        type: 'number',
        helpText: 'A numeric value to save with the Custom record to be saved.',
      },
      {
        key: 'datetime1',
        label: 'DateTime1',
        required: false,
        type: 'datetime',
        helpText: 'A date/time value to save with the Custom record to be saved.',
      },
    ],

    perform: createCustom,

    sample: {
      Key: 'key',
      Name: 'name',
    },

    outputFields: [
      {key: 'Key', type: 'string', label: 'Custom Record Key'},
      {key: 'Name', type: 'string', label: 'Custom Record Name'},
      {key: 'Description', type: 'text', label: 'Custom Record Description'},
      {key: 'Text1', type: 'text', label: 'Custom Record Text1'},
      {key: 'Number1', type: 'integer', label: 'Custom Record Number1'},
      {key: 'Numeric1', type: 'number', label: 'Custom Record Numeric1'},
      {key: 'DateTime1', type: 'datetime', label: 'Custom Record DateTime1'},
    ],
  },
};
