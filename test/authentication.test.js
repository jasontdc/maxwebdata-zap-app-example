const auth = require('../authentication');

describe('oauth2 app', () => {
  describe('getAccessToken', () => {
    it('Requests an access token', async () => {
      const bundle = {
        inputData: {
          clientid: 'id',
          clientsecret: 'secret',
          maximizerurl: 'url',
          redirect_uri: 'uri',
          code: 'c',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          access_token: 'atoken',
          refresh_token: 'rtoken',
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
      };
      const token = await auth.config.oauth2Config.getAccessToken(z, bundle);
      expect(token).toEqual({
        access_token: 'atoken',
        refresh_token: 'rtoken',
      });
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebAuthentication/OAuth2/Token',
        method: 'POST',
        body: {
          client_id: 'id',
          client_secret: 'secret',
          grant_type: 'authorization_code',
          code: 'c',
          redirect_uri: 'uri',
        },
        headers: {'content-type': 'application/x-www-form-urlencoded'},
      });
    });

    it('getAccessToken requests an access token with parameters from authData', async () => {
      const bundle = {
        inputData: {},
        authData: {
          clientid: 'id',
          clientsecret: 'secret',
          maximizerurl: 'url',
          redirect_uri: 'uri',
          code: 'c',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          access_token: 'atoken',
          refresh_token: 'rtoken',
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
      };
      const token = await auth.config.oauth2Config.getAccessToken(z, bundle);
      expect(token).toEqual({
        access_token: 'atoken',
        refresh_token: 'rtoken',
      });
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebAuthentication/OAuth2/Token',
        method: 'POST',
        body: {
          client_id: 'id',
          client_secret: 'secret',
          grant_type: 'authorization_code',
          code: 'c',
          redirect_uri: 'uri',
        },
        headers: {'content-type': 'application/x-www-form-urlencoded'},
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('Refreshes an access token', async () => {
      const bundle = {
        inputData: {},
        authData: {
          clientid: 'id',
          clientsecret: 'secret',
          maximizerurl: 'url',
          redirect_uri: 'uri',
          refresh_token: 'rtoken',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          access_token: 'atoken',
          refresh_token: 'rtoken',
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
      };
      const token = await auth.config.oauth2Config.refreshAccessToken(z, bundle);
      expect(token).toEqual({
        access_token: 'atoken',
        refresh_token: 'rtoken',
      });
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebAuthentication/OAuth2/Token',
        method: 'POST',
        body: {
          client_id: 'id',
          client_secret: 'secret',
          grant_type: 'refresh_token',
          refresh_token: 'rtoken',
          redirect_uri: 'uri',
        },
        headers: {'content-type': 'application/x-www-form-urlencoded'},
      });
    });
  });

  describe('test', () => {
    it('Checks that the token is valid using inputData', async () => {
      const bundle = {
        inputData: {
          maximizerurl: 'url',
        },
        authData: { },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          Code: 0,
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
      };
      const response = await auth.config.test(z, bundle);
      expect(response).toEqual({
        data: {
          Code: 0,
        },
      });
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebData/Data.svc/json/GetSessionInfo',
        method: 'POST',
        body: JSON.stringify({
          User: {
            DisplayName: 1,
          },
          AddressBook: {
            DisplayValue: 1,
          },
        }),
      });
    });

    it('Checks that the token is valid using authData', async () => {
      const bundle = {
        inputData: { },
        authData: {
          maximizerurl: 'url',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          Code: 0,
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
      };
      const response = await auth.config.test(z, bundle);
      expect(response).toEqual({
        data: {
          Code: 0,
        },
      });
      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebData/Data.svc/json/GetSessionInfo',
        method: 'POST',
        body: JSON.stringify({
          User: {
            DisplayName: 1,
          },
          AddressBook: {
            DisplayValue: 1,
          },
        }),
      });
    });

    it('Throws a RefreshAuthError if the token is invalid', async () => {
      const bundle = {
        inputData: { },
        authData: {
          maximizerurl: 'url',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          Code: -1,
          Msg: ['Invalid token'],
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
        errors: {
          RefreshAuthError: jest.fn((_x) => class RefreshAuthError extends Error {}),
          Error: jest.fn((_x) => Error),
        },
      };

      let error;
      try {
        await auth.config.test(z, bundle);
      } catch (e) {
        error = e;
      }

      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebData/Data.svc/json/GetSessionInfo',
        method: 'POST',
        body: JSON.stringify({
          User: {
            DisplayName: 1,
          },
          AddressBook: {
            DisplayValue: 1,
          },
        }),
      });

      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(1);
      expect(z.errors.Error.mock.calls.length).toBe(0);
      expect(error).toBeDefined();
    });

    it('Throws an Error if the API returns an error', async () => {
      const bundle = {
        inputData: { },
        authData: {
          maximizerurl: 'url',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          Code: -1,
          Msg: ['An error occurred.'],
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
        errors: {
          RefreshAuthError: jest.fn((_x) => class RefreshAuthError extends Error {}),
          Error: jest.fn((_x) => Error),
        },
      };

      let error;
      try {
        await auth.config.test(z, bundle);
      } catch (e) {
        error = e;
      }

      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebData/Data.svc/json/GetSessionInfo',
        method: 'POST',
        body: JSON.stringify({
          User: {
            DisplayName: 1,
          },
          AddressBook: {
            DisplayValue: 1,
          },
        }),
      });

      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(0);
      expect(z.errors.Error.mock.calls.length).toBe(1);
      expect(z.errors.Error.mock.calls[0][0]).toEqual(JSON.stringify(['An error occurred.']));
      expect(error).toBeDefined();
    });

    it('Throws a generic Error if the API returns an error code without a message', async () => {
      const bundle = {
        inputData: { },
        authData: {
          maximizerurl: 'url',
        },
      };
      const requestFn = jest.fn().mockResolvedValue({
        data: {
          Code: -1,
        },
      });
      const z = {
        console: {log: jest.fn()},
        request: requestFn,
        errors: {
          RefreshAuthError: jest.fn((_x) => class RefreshAuthError extends Error {}),
          Error: jest.fn((_x) => Error),
        },
      };

      let error;
      try {
        await auth.config.test(z, bundle);
      } catch (e) {
        error = e;
      }

      expect(requestFn).toHaveBeenCalledTimes(1);
      expect(requestFn).toHaveBeenCalledWith({
        url: 'url/MaximizerWebData/Data.svc/json/GetSessionInfo',
        method: 'POST',
        body: JSON.stringify({
          User: {
            DisplayName: 1,
          },
          AddressBook: {
            DisplayValue: 1,
          },
        }),
      });

      expect(z.errors.RefreshAuthError.mock.calls.length).toBe(0);
      expect(z.errors.Error.mock.calls.length).toBe(1);
      expect(z.errors.Error.mock.calls[0][0]).toEqual('Unable to verify authentication status.');
      expect(error).toBeDefined();
    });
  });

  describe('handleAuthErrors', () => {
    it('Returns the unmodified response for sucessful requests', () => {
      const z = {
        console: {log: jest.fn()},
      };
      const response = {
        status: 200,
        data: {
          Code: 0,
          Data: {
            example: 'test',
          },
        },
      };

      const handleAuthErrors = auth.afters[0];
      const newResponse = handleAuthErrors(response, z);

      expect(newResponse).toEqual(response);
    });

    it('Returns the unomdified response for non-200 status codes', () => {
      const z = {
        console: {log: jest.fn()},
      };
      const response = {
        status: 403,
        data: {
          Code: 0,
          Data: {
            example: 'test',
          },
        },
      };

      const handleAuthErrors = auth.afters[0];
      const newResponse = handleAuthErrors(response, z);

      expect(newResponse).toEqual(response);
    });

    it('Returns the unomdified response if there is no response body', () => {
      const z = {
        console: {log: jest.fn()},
      };
      const response = {
        status: 200,
      };

      const handleAuthErrors = auth.afters[0];
      const newResponse = handleAuthErrors(response, z);

      expect(newResponse).toEqual(response);
    });

    it('Changes the status code to 401 if the token is invalid.', () => {
      const z = {
        console: {log: jest.fn()},
      };
      const response = {
        status: 200,
        data: {
          Code: -1,
          Msg: ['Invalid token'],
        },
      };

      const handleAuthErrors = auth.afters[0];
      const newResponse = handleAuthErrors(response, z);

      expect(newResponse.status).toEqual(401);
      expect(newResponse.data).toEqual(response.data);
    });

    it('Throws an error if the API returns an error not related to the token.', () => {
      const z = {
        console: {log: jest.fn()},
        errors: {Error: jest.fn((_x) => Error)},
      };
      const response = {
        status: 200,
        data: {
          Code: -1,
          Msg: ['An unknown error has occurred.'],
        },
      };

      const handleAuthErrors = auth.afters[0];
      let error;
      try {
        handleAuthErrors(response, z);
      } catch (e) {
        error = e;
      }

      expect(z.errors.Error.mock.calls.length).toBe(1);
      expect(z.errors.Error.mock.calls[0][0]).toEqual(JSON.stringify({
        Code: -1,
        Msg: ['An unknown error has occurred.'],
      }));
      expect(error).toBeDefined();
    });

    it('Throws an error if the API returns an error but no message.', () => {
      const z = {
        console: {log: jest.fn()},
        errors: {Error: jest.fn((_x) => Error)},
      };
      const response = {
        status: 200,
        data: {
          Code: -1,
        },
      };

      const handleAuthErrors = auth.afters[0];
      let error;
      try {
        handleAuthErrors(response, z);
      } catch (e) {
        error = e;
      }

      expect(z.errors.Error.mock.calls.length).toBe(1);
      expect(z.errors.Error.mock.calls[0][0]).toEqual(JSON.stringify({
        Code: -1,
      }));
      expect(error).toBeDefined();
    });
  });

  describe('includeBearerToken', () => {
    it('Adds the bearer token to the request', () => {
      const request = {
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const bundle = {
        authData: {
          access_token: 'token',
        },
      };

      const includeBearerToken = auth.befores[0];
      const newRequest = includeBearerToken(request, undefined, bundle);

      expect(newRequest).toEqual({
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer token',
        },
      });
    });

    it('Replaces the Authorization header if there is already one present', () => {
      const request = {
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'oldauth',
        },
      };
      const bundle = {
        authData: {
          access_token: 'token',
        },
      };

      const includeBearerToken = auth.befores[0];
      const newRequest = includeBearerToken(request, undefined, bundle);

      expect(newRequest).toEqual({
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer token',
        },
      });
    });

    it('Does nothing if there is no access token', () => {
      const request = {
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const bundle = {
        authData: { },
      };

      const includeBearerToken = auth.befores[0];
      const newRequest = includeBearerToken(request, undefined, bundle);

      expect(newRequest).toEqual({
        url: 'url',
        method: 'POST',
        body: {
          example: 'test',
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      });
    });
  });
});
