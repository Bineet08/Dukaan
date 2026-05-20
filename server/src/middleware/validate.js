const validate = (schema, source = "body") => (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorDetails = error.details.map(detail => detail.message).join(", ");
        return res.status(400).json({
            success: false,
            message: errorDetails,
            error: errorDetails
        });
    }

    req[source] = value;
    next();
};

module.exports = validate;
