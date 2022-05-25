const Maximizer = require('../../lib/maximizer');

const bundle = {authData: {maximizerurl: 'test/'}};
const z = {
  console: {log: jest.fn()},
  request: jest.fn(),
  errors: {RefreshAuthError: jest.fn((_x) => class RefreshAuthError extends Error {})},
};

describe('Maximizer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('Creates an object with the class members set', () => {
      const max = new Maximizer(z, bundle);
      expect(max).toBeInstanceOf(Maximizer);
      expect(max.z).toEqual(z);
      expect(max.baseurl).toEqual('test/MaximizerWebData/Data.svc/json');
    });

    it('Sets the base URL correctly if the supplied URL does not have a trailing slash', () => {
      const max = new Maximizer(z, {authData: {maximizerurl: 'test'}});
      expect(max).toBeInstanceOf(Maximizer);
      expect(max.z).toEqual(z);
      expect(max.baseurl).toEqual('test/MaximizerWebData/Data.svc/json');
    });
  });

  describe('sendMaximizerApiRequest', () => {
    it('Sends the API request to the correct URL', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: 0}}));

      const response = await max.sendMaximizerApiRequest('Read', 'request', {example: 'headers'});
      expect(response).toEqual({Code: 0});
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {example: 'headers'},
        body: 'request',
      });
    });

    it('Sets the default headers if none are supplied', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: 0}}));

      const response = await max.sendMaximizerApiRequest('Read', 'request');
      expect(response).toEqual({Code: 0});
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: 'request',
      });
    });

    it('Stringifies JSON objects in the request', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: 0}}));

      const response = await max.sendMaximizerApiRequest('Read', {example: 'request'});
      expect(response).toEqual({Code: 0});
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({example: 'request'}),
      });
    });

    it('Does not stringify Buffers sent in the request', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: 0}}));

      const buffer = Buffer.from('example', 'utf8');
      const response = await max.sendMaximizerApiRequest('Read', buffer);
      expect(response).toEqual({Code: 0});
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: buffer,
      });
    });

    it('Throws a RefreshAuthError if the token is expired', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: -1, Msg: ['Invalid token.']}}));

      let error;
      try {
        // Should throw
        await max.sendMaximizerApiRequest('Read', 'request', {example: 'headers'});
      } catch (e) {
        error = e;
      }
      // Should have attempted the API request as usual
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {example: 'headers'},
        body: 'request',
      });
      // Should have logged only once
      expect(z.console.log.mock.calls.length).toBe(1);
      // Should have called the RefreshAuthError function
      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(1);
      // Should have thrown
      expect(error).toBeDefined();
    });

    it('Throws if the response code is not zero', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: -1, Msg: ['API Error.']}}));

      const response = max.sendMaximizerApiRequest('Read', 'request', {example: 'headers'});
      // Should throw
      await expect(response).rejects.toThrow(JSON.stringify(['API Error.']));
      // Should attempt the API request as usual
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {example: 'headers'},
        body: 'request',
      });
      // Should log twice
      expect(z.console.log.mock.calls.length).toBe(2);
      // Should not call the RefreshAuthError function
      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(0);
    });

    it('Supplies a generic error message if the API response does not include one.', async () => {
      const max = new Maximizer(z, bundle);

      z.request = jest.fn((_x) => ({data: {Code: -1}}));

      const response = max.sendMaximizerApiRequest('Read', 'request', {example: 'headers'});
      // Should throw
      await expect(response).rejects.toThrow('The Maximizer.Web.Data API request failed.');
      // Should attempt the API request as usual
      expect(z.request.mock.calls.length).toBe(1);
      expect(z.request.mock.calls[0][0]).toStrictEqual({
        url: 'test/MaximizerWebData/Data.svc/json/Read',
        method: 'POST',
        headers: {example: 'headers'},
        body: 'request',
      });
      // Should log twice
      expect(z.console.log.mock.calls.length).toBe(2);
      // Should not call the RefreshAuthError function
      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(0);
    });
  });
});
