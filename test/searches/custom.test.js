const customSearch = require('../../searches/custom');
const appId = require('../../package.json').name;
const Maximizer = require('../../lib/maximizer');
jest.mock('../../lib/maximizer');

describe('custom search', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Maximizer.mockReset();
  });

  it('Exports all required fields', () => {
    expect(customSearch).toHaveProperty('key');
    expect(customSearch).toHaveProperty('noun');
    expect(customSearch).toHaveProperty('display');
    expect(customSearch.display).toHaveProperty('label');
    expect(customSearch.display).toHaveProperty('description');
    expect(customSearch).toHaveProperty('operation');
    expect(customSearch.operation).toHaveProperty('inputFields');
    expect(customSearch.operation).toHaveProperty('perform');
    expect(typeof customSearch.operation.perform).toBe('function');
    expect(customSearch.operation).toHaveProperty('sample');
    expect(customSearch.operation).toHaveProperty('outputFields');
  });

  it('Searches for Custom records by name', async () => {
    const name = 'name';
    const bundle = {
      authData: { },
      inputData: {
        name: name,
      },
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
    const result = await customSearch.operation.perform(z, bundle);
    expect(result).toEqual([
      {
        Key: 'key',
        ApplicationId: appId,
        Name: name,
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
    });
  });

  it('Throws an error if the search fails', async () => {
    const name = 'name';
    const bundle = {
      authData: { },
      inputData: {
        name: name,
      },
    };

    // Mock the z object
    const z = {console: {log: jest.fn()}};

    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: jest.fn().mockResolvedValue({}),
      };
    });

    // Run the function
    const result = customSearch.operation.perform(z, bundle);
    await expect(result).rejects.toThrow('The search failed.');
  });

  it('Throws an error if the name is not supplied', async () => {
    const description = 'description';
    const bundle = {
      authData: { },
      inputData: {
        description: description,
      },
    };

    // Mock the z object
    const z = {console: {log: jest.fn()}};

    const sendMaximizerApiRequestFn = jest.fn();
    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: sendMaximizerApiRequestFn,
      };
    });

    // Run the function
    const result = customSearch.operation.perform(z, bundle);
    await expect(result).rejects.toThrow('The name field is required.');
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledTimes(0);
  });
});
