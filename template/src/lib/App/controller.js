/**
 * The app's Basic Controller methods and properties
 * @class
 */
export default class BaseController {
  /**
   * Binds this directive to all of controllers methods.
   * @constructor
   */
  // constructor() {
  //   let methods = H.methodsOf(this);
  //   for (var key of methods) {
  //     this[key] = this[key].bind(this);
  //   }
  // }

  /**
   * Checks if the given fields of a provided data matches any records in the model's database.
   * @param {Object} userData - The data being tested
   * @param {string[]} fields - The fields that are not suposed to be duplicated
   * @param {Sequelize.Model} Model - The model to be tested on
   */
  catchDuplicates = async (data, fields, Model) => {
    return new Promise(async (resolve, reject) => {
      for (let field in fields) {
        let currentField = fields[field];
        var link = null;
        if (currentField['field'] && currentField['link']) {
          link = currentField['link'];
          currentField = currentField['field'];
        }
        if (data[currentField]) {
          let where = {
            [currentField]: data[currentField],
            [link ? link[0] : 'nolink']: link ? link[1] : undefined
          };
          delete where['nolink'];
          let duplicateTest = await Model.findOne({
            where
          });
          if (duplicateTest) {
            return resolve({
              field: currentField,
              method: 'duplicated',
              valid: false
            });
          }
        } else {
          reject(
            new Error(
              'The data provided does not have the field ' + currentField
            )
          );
        }
      }
      resolve(null);
    });
  };

  /**
   * Asserts if the requesting user is a admin or matches the requested userId.
   * @param {HTTP Request} req
   * @param {number} userId
   * @returns {boolean}
   */
  assertUser = (req, userId) => {
    if (req.user.id == userId || req.user.level == 100) return true;
    else return false;
  };

  /** Reponse Models */

  respond = {
    /**
     * Respond with a success type answer to the client.
     * @param {HTTPResponse} res The HTTP Response Object/Stream
     * @param {string?} message A string message sent back to the client
     * @param {Object?} options A set of additional options sent back to the client. (These will be merged within the response object)
     * @returns {null}
     * @example this.respond.success(res,"This is a message sent to server", { updateToken: true })	=>	(200 "OK"):{ type: "success", success: true, message: "This is a message sent to server", updateToken: true }
     */
    success: async (res, message = '', options = null) => {
      res.status(200);
      let responseObject = { type: 'success', success: true, message };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    /**
     * Respond with a resource type answer to the client.
     * @param {HTTPResponse} res The HTTP Response Object/Stream.
     * @param {string[]|Object} resources A Object or Array containing the resources to send the client.
     * @param {object?} options A set of additional options sent back to the client. (These will be merged within the response object)
     * @returns {null}
     * @example this.respond.resource(res,{ list: [1,2] })	=>	(200 "OK"):{ type: "resource", success: true, resources: { list: [1,2] } }
     */
    resource: async (res, resources, options = null) => {
      res.status(200);
      resources.type = 'success';
      let responseObject = { type: 'resource', success: true, resources };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    /**
     * Respond with a invalid type answer to the client.
     * @param {HTTPResponse} res The HTTP Response Object/Stream.
     * @param {Object} validation A Object or Array containing the validation result to send the client.
     * @param {Object?} options A set of additional options sent back to the client. (These will be merged within the response object)
     * @returns {null}
     * @example this.respond.invalid(res, { method: "duplicated", field: "email" })	=>	(200 "OK"):{ type: "invalid", success: true, validation: { method: "duplicated", field: "email" } }
     */
    invalid: async (res, validation, options = null) => {
      res.status(200);
      let responseObject = { type: 'invalid', success: true, validation };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    /**
     * Respond with a unauthorized type answer to the client.
     * @param {HTTPResponse} res The HTTP Response Object/Stream.
     * @param {Object} error An error object containing info about the exception.
     * @param {Object?} options A set of additional options sent back to the client. (These will be merged within the response object)
     * @returns {null}
     * @example this.respond.unauthorized(res, { code: "NO_JWT", message: "Please revalidate", errorMessage: error.message })	=>	(401 "UNAUTHORIZED"):{ type: "unauthorized", success: false, error: { code: "...", message: "...", errorMessage: "..." } }
     */
    unauthorized: async (res, error, options = null) => {
      res.status(401);
      let responseObject = { success: false, type: 'unauthorized', error };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    forbidden: async (res, error, options = null) => {
      res.status(403);
      let responseObject = { success: false, error, updateToken: true };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    notFound: async (res, code, message, options = null) => {
      res.status(404);
      let responseObject = { success: false, error: { code, message } };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    },
    error: async (res, error, options = null) => {
      res.status(500);
      let responseObject = { success: false, error, updateToken: true };
      if (options) responseObject = Object.assign(responseObject, options);
      res.json(responseObject);
    }
  };
}
