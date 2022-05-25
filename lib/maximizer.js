/**
 * A helper class that has methods for accessing the Maximizer.Web.Data API.
 */
class Maximizer {
  /**
  * Constructor for the Maximizer class.
  * @param {z} z The z object supplied by Zapier.
  * @param {bundle} bundle The bundle object supplied by Zapier.
  */
  constructor(z, bundle) {
    this.z = z;
    this.baseurl = bundle.authData.maximizerurl;
    if (!this.baseurl.endsWith('/')) {
      this.baseurl = this.baseurl + '/';
    }
    this.baseurl = this.baseurl + 'MaximizerWebData/Data.svc/json';
  }

  /**
  * Sends a request to the Maximizer API.
  * @param {string} endpoint The Maximizer.Web.Data endpoint (e.g. "Read", "Create", ...)
  * @param {object} request The request object to be sent to the Maximizer.Web.Data API.
  * @param {object} headers An object containing custom headers to be sent with the request.
  * @return {object} The JSON response object.
  */
  async sendMaximizerApiRequest(endpoint, request, headers) {
    // Build the request body. If a string or buffer is supplied, we will send it as-is.
    // But if an object is supplied, we need to serialize it to a JSON string first.
    const body = typeof request === 'string' || request instanceof Buffer ? request : JSON.stringify(request);

    // Construct the request object to be sent to the Zapier z object's 'request' method.
    // The URL is constructed by adding the supplied endpoint to the base URL.
    // The HTTP method is always POST for requests to the Maximizer.Web.Data API.
    // If custom headers are supplied, they are used; otherwise, default to application/json.
    const req = {
      url: `${this.baseurl}/${endpoint}`,
      method: 'POST',
      headers: headers || {'Content-Type': 'application/json'},
      body: body,
    };

    // Use the Zapier 'z' object to send the request to the Maximizer.Web.Data API. See:
    // https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#making-http-requests
    const response = await this.z.request(req);

    // Check the 'Code' that is returned by the Maximizer.Web.Data API.
    // A Code of 0 indicates success, so we can simply return the response body.
    if (response.data.Code == 0) {
      return response.data;
    }

    // If we get a non-zero return Code, we need to see if it is complaining about an invalid token
    // by checking the error message that is returned.
    const message = JSON.stringify(response.data.Msg) || '';
    this.z.console.log(message);
    if (message.toLowerCase().indexOf('token') >= 0) {
      // If the error message indicates that there is an issue with the token (e.g. it is invalid or
      // expired), we will throw a 'RefreshAuthError' which should trigger the Zapier platform to
      // try to refresh the token via the OAuth2 API.
      throw new this.z.errors.RefreshAuthError();
    }

    // If some other has occurred, we will simply throw a generic error and include the message
    // that we got back from the API. This information will be surfaced in the Zapier UI for the
    // failed Zap so that we can do whatever troubleshooting we need to do.
    this.z.console.log('Unknown error!');
    throw new Error(message || 'The Maximizer.Web.Data API request failed.');
  }
}

module.exports = Maximizer;
