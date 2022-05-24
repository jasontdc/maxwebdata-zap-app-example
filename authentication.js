'use strict';

const getAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.inputData.maximizerurl || bundle.authData.maximizerurl}/MaximizerWebAuthentication/OAuth2/Token`,
    method: 'POST',
    body: {
      client_id: bundle.inputData.clientid || bundle.authData.clientid,
      client_secret: bundle.inputData.clientsecret || bundle.authData.clientsecret,
      grant_type: 'authorization_code',
      code: bundle.inputData.code || bundle.authData.code,
      redirect_uri: bundle.inputData.redirect_uri || bundle.authData.redirect_uri,

      // Extra data can be pulled from the querystring. For instance:
      // 'accountDomain': bundle.cleanedRequest.querystring.accountDomain
    },
    headers: {'content-type': 'application/x-www-form-urlencoded'},
  });

  // If you're using core v9.x or older, you should call response.throwForStatus()
  // or verify response.status === 200 before you continue.

  // This function should return `access_token`.
  // If your app does an app refresh, then `refresh_token` should be returned here
  // as well
  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const refreshAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.maximizerurl}/MaximizerWebAuthentication/OAuth2/Token`,
    method: 'POST',
    body: {
      client_id: bundle.authData.clientid,
      client_secret: bundle.authData.clientsecret,
      grant_type: 'refresh_token',
      refresh_token: bundle.authData.refresh_token,
      redirect_uri: bundle.authData.redirect_uri,
    },
    headers: {'content-type': 'application/x-www-form-urlencoded'},
  });

  // If you're using core v9.x or older, you should call response.throwForStatus()
  // or verify response.status === 200 before you continue.

  // This function should return `access_token`.
  // If the refresh token stays constant, no need to return it.
  // If the refresh token does change, return it here to update the stored value in
  // Zapier
  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.
const includeBearerToken = (request, _z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

const handleAuthErrors = (response, z) => {
  // Check for non-zero Code in API responses
  if (response.status == 200 && (response.data || {}).Code && response.data.Code != 0) {
    const message = JSON.stringify(response.data.Msg) || '';
    if (message.toLowerCase().indexOf('token') >= 0) {
      // Even though the token is invalid, the Maximizer API still returns a 200 response
      // We need to change it to a 401 so that Zapier will refresh the token
      response.status = 401;
    } else {
      throw new z.errors.Error(JSON.stringify(response.data));
    }
  }
  return response;
};

// You want to make a request to an endpoint that is either specifically designed
// to test auth, or one that every user will have access to. eg: `/me`.
// By returning the entire request object, you have access to the request and
// response data for testing purposes. Your connection label can access any data
// from the returned response using the `json.` prefix. eg: `{{json.username}}`.
const test = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.inputData.maximizerurl || bundle.authData.maximizerurl}/MaximizerWebData/Data.svc/json/GetSessionInfo`,
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

  // Because the Maximizer.Web.Data API doesn't return status codes, we need
  // to check the Code property in the response
  if (response.data.Code == 0) {
    return response;
  }

  // If we get a non-zero return Code, see if it is complaining about an invalid token
  const message = JSON.stringify(response.data.Msg) || '';
  if (message.toLowerCase().indexOf('token') >= 0) {
    throw new z.errors.RefreshAuthError();
  }

  // If not, something else went wrong
  throw new z.errors.Error(message || 'Unable to verify authentication status.');
};

module.exports = {
  config: {
    // OAuth2 is a web authentication standard. There are a lot of configuration
    // options that will fit most any situation.
    type: 'oauth2',
    oauth2Config: {
      authorizeUrl: {
        url: '{{bundle.inputData.maximizerurl}}/MaximizerWebAuthentication/OAuth2/Authorize',
        params: {
          client_id: '{{bundle.inputData.clientid}}',
          state: '{{bundle.inputData.state}}',
          redirect_uri: '{{bundle.inputData.redirect_uri}}',
          response_type: 'code',
        },
      },
      getAccessToken,
      refreshAccessToken,
      autoRefresh: true,
    },

    // Define any input app's auth requires here. The user will be prompted to enter
    // this info when they connect their account.
    fields: [
      {
        key: 'maximizerurl',
        type: 'string',
        label: 'Maximizer URL',
        helpText:
          'The base URL where your Maximizer server is located (e.g. https://www.example.com). Do not include the trailing slash, or any subdirectories.',
      },
      {
        key: 'clientid',
        type: 'string',
        label: 'Client ID',
        helpText:
          'The Client ID of the OAuth2 app profile in Maximizer.',
      },
      {
        key: 'clientsecret',
        type: 'string',
        label: 'Client Secret',
        helpText:
        'The Client Secret of the OAuth2 app profile in Maximizer.',
      },
    ],

    // The test method allows Zapier to verify that the credentials a user provides
    // are valid. We'll execute this method whenever a user connects their account for
    // the first time.
    test,

    // This template string can access all the data returned from the auth test. If
    // you return the test object, you'll access the returned data with a label like
    // `{{json.X}}`. If you return `response.data` from your test, then your label can
    // be `{{X}}`. This can also be a function that returns a label. That function has
    // the standard args `(z, bundle)` and data returned from the test can be accessed
    // in `bundle.inputData.X`.
    connectionLabel: '{{json.Data.AddressBook.DisplayValue}} - {{json.Data.User.DisplayName}}',
  },
  befores: [includeBearerToken],
  afters: [handleAuthErrors],
};
