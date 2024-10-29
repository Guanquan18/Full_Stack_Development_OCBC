const Joi = require("joi");

const validateAccessCodePin = (req, res, next) => {
    const schema = Joi.object({
        accessCode: Joi.string()
            .pattern(/^[0-9]{7}$/)  // 7 digits
            .required(),
        pin: Joi.string()
            .pattern(/^[0-9]{6}$/)  // 6 digits
            .required()
    });

    const validation = schema.validate(req.body, {abortEarly: false});

    if(validation.error){
        const errors = validation.error.details.map(error => error.message);
        return res.status(400).json({message: "Validation failed", errors: errors});
    }

    next(); // Move to the next middleware
}

module.exports = {
    validateAccessCodePin
};