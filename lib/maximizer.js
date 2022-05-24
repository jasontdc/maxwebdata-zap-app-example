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
    // Build request
    const body = typeof request === 'string' || request instanceof Buffer ? request : JSON.stringify(request);
    const req = {
      url: `${this.baseurl}/${endpoint}`,
      method: 'POST',
      headers: headers || {'Content-Type': 'application/json'},
      body: body,
    };

    // Send request
    const response = await this.z.request(req);
    if (response.data.Code == 0) {
      return response.data;
    }

    // If we get a non-zero return Code, see if it is complaining about an invalid token
    const message = JSON.stringify(response.data.Msg) || '';
    this.z.console.log(message);
    if (message.toLowerCase().indexOf('token') >= 0) {
      this.z.console.log('Authentication error in function!');
      throw new this.z.errors.RefreshAuthError();
    }

    // If not, something else went wrong
    this.z.console.log('Unknown error!');
    throw new Error(message || 'The Maximizer.Web.Data API request failed.');
  }
}

module.exports = Maximizer;
