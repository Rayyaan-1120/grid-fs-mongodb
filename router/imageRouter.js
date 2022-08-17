const express = require('express')
const imagerouter = express.Router()
const Imagecontroller = require('../controllers/imageController')
const multergridfs = require('../utils/multergridfs')
const upload = require('../utils/multergridfs')

imagerouter.post('/uploadimage',multergridfs.single('photo'),Imagecontroller.uploadimage)

module.exports = imagerouter