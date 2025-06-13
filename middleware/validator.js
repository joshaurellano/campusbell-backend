/* This handles validation between user inputs*/

const {body, validationResult} = require ('express-validator');

//Validation criteria
const userValidationRules = () => {
    return [
        body('username')
        .isLength({max: 10}).withMessage('Username should be maximum of 10 characters only'),
        body('password')
        .isLength({min: 5}).withMessage('Password should be minimum of 5 characters'),
        body('email')
        .isEmail().withMessage('Email not valid')
        .custom(value =>{
            const result = value.includes("gbox.ncf.edu.ph") || value.includes("gmail.com")
            return result
        }).withMessage("Only institutional NCF email is accepted"),
        body('first_name')
        .matches(/^[A-Za-z.-\s]+$/).withMessage('First name only accepts letters and characters "," and "-"'),
        body('middle_name')
        .optional()
        .matches(/^[A-Za-z.-\s]+$/).withMessage('Middle name only accepts letters and characters "," and "-"'),
        body('last_name')
        .matches(/^[A-Z a-z.-\s]+$/).withMessage('Last name only accepts letters and characters "," and "-"'),
        body('phone_number')
        .matches(/^[0-9 - +]+$/).withMessage('Phone Number only accepts numbers and character "-"')
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
        message:validation_errors
    })
}
module.exports = {userValidationRules,validate}