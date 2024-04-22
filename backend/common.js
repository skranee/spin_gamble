import joi from "joi";

function validate_body(res, req, data)
{
    const schema = joi.object(data);
    const { error } = schema.validate(req.body);
    if (error) res.status(400).send(error.details[0].message);
    return !error;
}

export { validate_body };