const customTrigger = require('../../triggers/custom');
const appId = require('../../package.json').name;
const Maximizer = require('../../lib/maximizer');
jest.mock('../../lib/maximizer');

describe('custom trigger', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Maximizer.mockReset();
  });

  it('Exports all required fields', () => {
    expect(customTrigger).toHaveProperty('key');
    expect(customTrigger).toHaveProperty('noun');
    expect(customTrigger).toHaveProperty('display');
    expect(customTrigger.display).toHaveProperty('label');
    expect(customTrigger.display).toHaveProperty('description');
    expect(customTrigger).toHaveProperty('operation');
    expect(customTrigger.operation).toHaveProperty('inputFields');
    expect(customTrigger.operation).toHaveProperty('perform');
    expect(typeof customTrigger.operation.perform).toBe('function');
    expect(customTrigger.operation).toHaveProperty('sample');
    expect(customTrigger.operation).toHaveProperty('outputFields');
  });

  it('Searches for new Custom records', async () => {
    const name = 'name';
    const description = 'description';
    const text1 = 'text1';
    const number1 = 12345;
    const numeric1 = 123.45;
    const datetime1 = new Date();
    const bundle = {
      authData: { },
      inputData: { },
    };

    // Mock the z object
    const z = {console: {log: jest.fn()}};

    const sendMaximizerApiRequestFn = jest.fn().mockResolvedValue({
      Code: 0,
      Custom: {
        Data: [
          {
            Key: 'key',
            ApplicationId: appId,
            Name: name,
            Decription: description,
            Text1: text1,
            Number1: number1,
            Numeric1: numeric1,
            DateTime1: datetime1,
          },
        ],
      },
    });
    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: sendMaximizerApiRequestFn,
      };
    });

    // Run the function
    const result = await customTrigger.operation.perform(z, bundle);
    expect(result).toEqual([
      {
        id: 'key', // Ensure the Key is set as the 'id' of the object
        Key: 'key',
        ApplicationId: appId,
        Name: name,
        Decription: description,
        Text1: text1,
        Number1: number1,
        Numeric1: numeric1,
        DateTime1: datetime1,
      },
    ]);
    // Ensure that the Maximizer constructor was called...
    expect(Maximizer).toHaveBeenCalledTimes(1);
    // ...and that the sendMaximizerApiRequest function was called with the correct parameters...
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledTimes(1);
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledWith('Read', {
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
    });
  });

  it('Throws an error if the search fails', async () => {
    const bundle = {
      authData: { },
      inputData: { },
    };

    // Mock the z object
    const z = {console: {log: jest.fn()}};

    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: jest.fn().mockResolvedValue({}),
      };
    });

    // Run the function
    const result = customTrigger.operation.perform(z, bundle);
    await expect(result).rejects.toThrow('The search failed.');
  });
});
