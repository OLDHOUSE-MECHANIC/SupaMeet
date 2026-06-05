import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const traceId = (req, res, next) => {
  const id = req.headers['x-trace-id'] || uuidv4();
  res.locals.traceId = id;
  res.setHeader('x-trace-id', id);

  res.on('finish', () => {
    logger.info({
      traceId: id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });
  });

  next();
};

export default traceId;
