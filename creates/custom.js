const Maximizer = require('../lib/maximizer');

/**
* This is the function that implements the main logic of our "Custom Create" action.
* @param {object} z The "z" object supplied by the Zapier platform. It includes
* methods for sending HTTP requests, and writing logs to the Zapier platform. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#z-object
* @param {object} bundle The "bundle" supplied by the Zapier platform. It includes
* authentication details as well as user input for the Zapier action. See:
* https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#bundle-object
* @return {object} The Custom record that was created in Maximizer.
*/
const createCustom = async (z, bundle) => {
  // Enforce mandatory fields
  if (!bundle.inputData.name) {
    throw new Error('The name field is required.');
  }

  // We'll use the app name from package.json as the ApplicationId for the Custom record.
  // This allows us to identify Custom records created by our app, and to differentiate them
  // from Custom records created by other apps and integrations. See:
  // https://developer.maximizer.com/doc/api-reference/custom
  const appId = require('../package.json').name;

  // Start building the API request that we will send to
  // the Maximizer.Web.Data API to create the Custom record.
  // For information on constructing Maximizer.Web.Data API requests, see:
  // https://developer.maximizer.com/doc/api-reference/basic-request-syntax
  const request = {
    Custom: {
      Data: {
        Key: null,
        ApplicationId: appId,
        Name: bundle.inputData.name,
      },
    },
  };

  // Add the optional fields to the request, if supplied
  if (bundle.inputData.description) {
    request.Custom.Data['Description'] = bundle.inputData.description;
  }
  if (bundle.inputData.text1) {
    request.Custom.Data['Text1'] = bundle.inputData.text1;
  }
  if (bundle.inputData.number1) {
    request.Custom.Data['Number1'] = bundle.inputData.number1;
  }
  if (bundle.inputData.numeric1) {
    request.Custom.Data['Numeric1'] = bundle.inputData.numeric1;
  }
  if (bundle.inputData.datetime1) {
    request.Custom.Data['DateTime1'] = bundle.inputData.datetime1;
  }

  // Create an instance of our helper class that we'll use to send the API request.
  const max = new Maximizer(z, bundle);

  // Send the "Create" request to the Maximizer.Web.Data API
  // to create the new Custom record
  const result = await max.sendMaximizerApiRequest('Create', request);

  // Make sure the record was created
  if (!(result.Custom || {}).Data) {
    throw new Error('Unable to create the Custom record.');
  }

  // Return the Custom record that was created so that the values
  // are available in subsequent Zap steps
  return result.Custom.Data;
};

module.exports = {
  key: 'custom',

  noun: 'Custom',
  display: {
    label: 'Create Custom Record',
    description: 'Creates a new Custom record in Maximizer (also known as a CustomIndependent record).',
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
        helpText: 'A text value to include with the Custom record to be saved.',
      },
      {
        key: 'number1',
        label: 'Number1',
        required: false,
        type: 'integer',
        helpText: 'An integer value to include with the Custom record to be saved.',
      },
      {
        key: 'numeric1',
        label: 'Numeric1',
        required: false,
        type: 'number',
        helpText: 'A numeric value to include with the Custom record to be saved.',
      },
      {
        key: 'datetime1',
        label: 'DateTime1',
        required: false,
        type: 'datetime',
        helpText: 'A date/time value to include with the Custom record to be saved.',
      },
    ],

    perform: createCustom,

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
      {key: 'ApplicationId', type: 'string', label: 'Custom Record Application ID'},
      {key: 'Name', type: 'string', label: 'Custom Record Name'},
      {key: 'Description', type: 'text', label: 'Custom Record Description'},
      {key: 'Text1', type: 'text', label: 'Custom Record Text1'},
      {key: 'Number1', type: 'integer', label: 'Custom Record Number1'},
      {key: 'Numeric1', type: 'number', label: 'Custom Record Numeric1'},
      {key: 'DateTime1', type: 'datetime', label: 'Custom Record DateTime1'},
    ],
  },
};
