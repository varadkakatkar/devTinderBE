const validator = require("validator");
const { GENDER_OPTIONS, ALLOWED_UPDATE_FIELDS } = require("./constants");

// For signup/add: all required fields must be present and validated
const checkSignupValidations = (req, res, next) => {
    try {
        const { firstName, lastName, emailId, password, age, gender, photoUrl } = req.body || {};

        if (!firstName || !emailId || !password || !age) {
            return res.status(400).json({ error: "First name, email, password and age are required" });
        }
        if (!validator.isEmail(emailId)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ error: "Password is not strong" });
        }
        if (age < 18) {
            return res.status(400).json({ error: "Age must be greater than 18" });
        }
        if (gender && !GENDER_OPTIONS.includes(gender)) {
            return res.status(400).json({ error: "Invalid gender" });
        }
        if (photoUrl && !validator.isURL(photoUrl)) {
            return res.status(400).json({ error: "Invalid photo URL" });
        }
        next();
    } catch (err) {
        next(err);
    }
};

// For update: only validate fields that are present (not all required)
const checkUpdateValidations = (req, res, next) => {
    try {
        const disallowedFields = Object.keys(req.body || {}).filter(
            (field) => !ALLOWED_UPDATE_FIELDS.includes(field)
        );
        if (disallowedFields.length > 0) {
            return res.status(400).json({
                error: "Update not allowed",
                disallowedFields,
            });
        }

        const { emailId, password, age, gender, photoUrl } = req.body || {};

        if (emailId !== undefined && !validator.isEmail(emailId)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (password !== undefined && !validator.isStrongPassword(password)) {
            return res.status(400).json({ error: "Password is not strong" });
        }
        if (age !== undefined && age < 18) {
            return res.status(400).json({ error: "Age must be greater than 18" });
        }
        if (gender !== undefined && !GENDER_OPTIONS.includes(gender)) {
            return res.status(400).json({ error: "Invalid gender" });
        }
        if (photoUrl !== undefined && photoUrl && !validator.isURL(photoUrl)) {
            return res.status(400).json({ error: "Invalid photo URL" });
        }
        if (skills !== undefined && !Array.isArray(skills)) {
            return res.status(400).json({ error: "Skills must be an array" });
        }else if(skills.length >10){
            return res.status(400).json({ error: "Skills must be less than 10" });
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { checkSignupValidations, checkUpdateValidations };
