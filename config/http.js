/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

const MetricsMiddleware = require('http-metrics-middleware')

const {auth, initialize} = require('../api/middleware/auth')
const i18n = require('../api/middleware/i18n')
const backend = require('../api/middleware/proxy').backend
const pages = require('../api/middleware/proxy').pages

const metrics = (new MetricsMiddleware()).initRoutes()

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {
    initializeAuth: initialize,
    auth: auth,
    i18n: i18n,
    metrics: metrics,
    backend: backend,
    pages: pages,

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'metrics',
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'initializeAuth',
      'auth',
      'i18n',
      'router',
      'www',
      'favicon',
      'pages',
      'backend',
    ],

    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

  },

};
