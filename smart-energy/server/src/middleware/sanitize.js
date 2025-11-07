import mongoSanitize from 'express-mongo-sanitize';
import sanitizeHtml from 'sanitize-html';

export const mongoSanitizeMiddleware = mongoSanitize(); // [REQ:NoSQLi:prevention]

export function sanitizeString(str) {
  // Restrictive policy for user-generated text (notes, messages)
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
  }); // [REQ:XSS:validate]
}

export function sanitizeBodyStrings(fields = []) {
  return (req, _res, next) => {
    fields.forEach((f) => {
      if (typeof req.body?.[f] === 'string') {
        req.body[f] = sanitizeString(req.body[f]); // [REQ:XSS:validate]
      }
    });
    next();
  };
}
