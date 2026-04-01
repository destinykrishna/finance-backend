const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

//POST /api/auth/register
const register = async (req, res) => {
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({success: false, message: 'All fields are required'})
        }

        const isUserExist = await userModel.findOne({email})

        if(isUserExist){
            return res.status(400).json({success: false, message: 'User already exists'})
        }

        const user = await userModel.create({
            name,
            email,
            password
        })

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})

        res.cookie('token', token)

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        })

    }catch(err){
        // console.error(err)
        res.status(500).json({success: false, message: err.message})
    }
}


//POST /api/auth/login
const login = async (req, res) => {
     try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({success: false, message: 'All fields are required'})
        }

        const user = await userModel.findOne({email})
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({success: false, message: 'Invalid credentials'})
        }

        if(!user.isActive){
            return res.status(403).json({success: false, message: 'Account is deactivated. Please contact support.'})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})

        res.cookie('token', token)

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        })
     }catch(err){
        // console.error(err)
        res.status(500).json({success: false, message: err.message})
     }
}

module.exports = {
    register,
    login
}