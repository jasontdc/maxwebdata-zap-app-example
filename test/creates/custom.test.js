const customCreate = require('../../creates/custom');
const appId = require('../../package.json').name;
const Maximizer = require('../../lib/maximizer');
jest.mock('../../lib/maximizer');

describe('custom create', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Maximizer.mockReset();
  });

  it('Exports all required fields', () => {
    expect(customCreate).toHaveProperty('key');
    expect(customCreate).toHaveProperty('noun');
    expect(customCreate).toHaveProperty('display');
    expect(customCreate.display).toHaveProperty('label');
    expect(customCreate.display).toHaveProperty('description');
    expect(customCreate).toHaveProperty('operation');
    expect(customCreate.operation).toHaveProperty('inputFields');
    expect(customCreate.operation).toHaveProperty('perform');
    expect(typeof customCreate.operation.perform).toBe('function');
    expect(customCreate.operation).toHaveProperty('sample');
    expect(customCreate.operation).toHaveProperty('outputFields');
  });

  it('Creates a Custom record', async () => {
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
        Data: {
          Key: 'key',
          ApplicationId: appId,
          Name: name,
        },
      },
    });
    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: sendMaximizerApiRequestFn,
      };
    });

    // Run the function
    const result = await customCreate.operation.perform(z, bundle);
    expect(result).toEqual({
      Key: 'key',
      ApplicationId: appId,
      Name: name,
    });
    // Ensure that the Maximizer constructor was called...
    expect(Maximizer).toHaveBeenCalledTimes(1);
    // ...and that the sendMaximizerApiRequest function was called with the correct parameters...
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledTimes(1);
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledWith('Create', {
      Custom: {
        Data: {
          Key: null,
          ApplicationId: appId,
          Name: name,
        },
      },
    });
  });

  it('Includes the optional fields if they are supplied', async () => {
    const name = 'name';
    const description = 'description';
    const text = 'text';
    const number = 12345;
    const numeric = 123.45;
    const datetime = new Date();

    const bundle = {
      authData: { },
      inputData: {
        name: name,
        description: description,
        text1: text,
        number1: number,
        numeric1: numeric,
        datetime1: datetime,
      },
    };

    // Mock the z object
    const z = {console: {log: jest.fn()}};

    const sendMaximizerApiRequestFn = jest.fn().mockResolvedValue({
      Code: 0,
      Custom: {
        Data: {
          Key: 'key',
          ApplicationId: appId,
          Name: name,
          Description: description,
          Text1: text,
          Number1: number,
          Numeric1: numeric,
          DateTime1: datetime,
        },
      },
    });
    Maximizer.mockImplementation(() => {
      return {
        sendMaximizerApiRequest: sendMaximizerApiRequestFn,
      };
    });

    // Run the function
    const result = await customCreate.operation.perform(z, bundle);
    expect(result).toEqual({
      Key: 'key',
      ApplicationId: appId,
      Name: name,
      Description: description,
      Text1: text,
      Number1: number,
      Numeric1: numeric,
      DateTime1: datetime,
    });
    // Ensure that the Maximizer constructor was called...
    expect(Maximizer).toHaveBeenCalledTimes(1);
    // ...and that the sendMaximizerApiRequest function was called with the correct parameters...
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledTimes(1);
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledWith('Create', {
      Custom: {
        Data: {
          Key: null,
          ApplicationId: appId,
          Name: name,
          Description: description,
          Text1: text,
          Number1: number,
          Numeric1: numeric,
          DateTime1: datetime,
        },
      },
    });
  });

  it('Throws an error if the record is not created', async () => {
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
    const result = customCreate.operation.perform(z, bundle);
    await expect(result).rejects.toThrow('Unable to create the Custom record.');
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
    const result = customCreate.operation.perform(z, bundle);
    await expect(result).rejects.toThrow('The name field is required.');
    expect(sendMaximizerApiRequestFn).toHaveBeenCalledTimes(0);
  });
});
