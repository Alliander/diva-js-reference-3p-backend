const divaSession = require('diva-irma-js/session');
const config = require('./../config');
const request = require('superagent');
const logger = require('./../common/logger')('actions');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const sessionId = req.sessionId;
  divaSession.getAttributes(sessionId)
    .then((attributes) => {
      const street = attributes['irma-demo.MijnOverheid.address.street'][0].replace(' ', '%20');
      const city = attributes['irma-demo.MijnOverheid.address.city'][0];
      const url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/CanvasLight/Netherlands%20${city}%20${street}/1`;
      request
        .get(url)
        .query({
          format: 'jpeg',
          key: config.bingMapsApiKey,
        })
        .end((err, imageResponse) => {
          if (err) {
            logger.warn('Error retrieving Bing maps image');
            logger.debug(err);
            return res.sendStatus(500);
          }

          res.setHeader('Content-type', 'image/jpeg');
          res.setHeader('Content-Disposition', 'inline; filename="address.jpg"'); // Note: to force display in browser
          return res.end(imageResponse.body);
        });
    });
};
