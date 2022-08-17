const express = require('express')
const UserController = require('../controllers/userController')
const multergridfs = require('../utils/multergridfs')

const userrouter = express.Router()


userrouter.post('/signupuser',multergridfs.single('photo'), UserController.signupuser)
userrouter.get('/getallusers', UserController.getallusers)
userrouter.post('/loginuser', UserController.loginuser)
userrouter.get('/searchuser', UserController.searchusers)
userrouter.get('/getSingleUser/:id/:filename', UserController.getSingleUser)


module.exports = userrouter