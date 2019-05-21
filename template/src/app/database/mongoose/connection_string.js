import yn from 'yn';

const connectionString = `mongodb://${process.env.MONGODB_USERNAME}:${
  process.env.MONGODB_PASSWORD
}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${
  process.env.NODE_ENV === 'testing'
    ? `${process.env.MONGODB_DATABASE}Testing`
    : process.env.MONGODB_DATABASE
}${
  yn(process.env.MONGODB_AUTH)
    ? `?authSource=${process.env.MONGODB_AUTHSOURCE}`
    : ''
}`;

module.exports = exports = connectionString;
