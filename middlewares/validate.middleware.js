export function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: "Request validation failed", errors: result.error.issues.map((item) => ({ field: item.path.join("."), message: item.message })) });
    }
    req.body = result.data;
    next();
  };
}
