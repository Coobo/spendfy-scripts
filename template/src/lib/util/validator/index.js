import { app as logger } from '@coobo/spendfy-logger';
import JoiBase from 'joi';
import documentValidator from 'cpf-cnpj-validator';

const Joi = JoiBase.extend(documentValidator);

const validator = exports;
validator.Joi = Joi;

/**
 * Generates a middleware to validate a incoming request
 * @param {string} data The Express Request property to read the data from
 * @param {Joi.Schema} schema Joi Schema to validate Request against
 * @function
 * @returns {Function} The middleware to validate the provided schema
 */
validator.validate = (dataField, schema) => {
  let middleware = (req, res, next) => {
    let requestId = req.headers.requestid;
    const data = req[dataField];

    logger.debug({
      message: 'Starting validation with data',
      url: req.originalUrl,
      requestId,
      data
    });

    const result = Joi.validate(data, schema);
    logger.debug({
      message: 'Validation ran',
      url: req.originalUrl,
      requestId,
      result
    });
    if (result.error) {
      logger.debug({
        message: 'Validation failed',
        url: req.originalUrl,
        requestId
      });

      res.status(400);
      return res.send(result.error);
    }

    logger.debug({
      message: 'Validation passed',
      url: req.originalUrl,
      requestId
    });

    next();
  };

  return middleware;
};
