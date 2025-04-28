/* This handles validation between user inputs*/

const {body, validationResult} = require ('express-validator');

//Validation criteria
const userValidationRules = () => {
    return [
        body('password')
        .isLength({min: 5}).withMessage('Password should be minimum of 5 characters'),
        body('email')
        .isEmail().withMessage('Email not valid')
        .custom(value =>{
            const result = value.includes("gbox.ncf.edu.ph")
            return result
        }).withMessage("Email address is not accepted"),
        body('first_name')
        .matches(/^[A-Za-z.-\s]+$/).withMessage('Only letters and characters "," and "-" are allowed'),
        body('middle_name')
        .optional()
        .matches(/^[A-Za-z.-\s]+$/).withMessage('Only letters and characters "," and "-" are allowed'),
        body('last_name')
        .matches(/^[A-Z a-z.-\s]+$/).withMessage('Only letters and characters "," and "-" are allowed'),
        body('phone_number')
        .matches(/^[0-9 - +]+$/).withMessage('Only numbers and character "-" are allowed')
        .isLength({min:9,max:13}).withMessage('Phone number should be minimum of 9 characters and maximum of 13 characters')
    ]

}   
const validate = (req,res,next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()){
        return next() 
    }
    const validation_errors = []
    const test_error = errors.array()
    errors.array().map(err => validation_errors.push(err.msg))

    return res.status(422).json({
        status:'Error',
        errors:validation_errors
    })
}
module.exports = {userValidationRules,validate}