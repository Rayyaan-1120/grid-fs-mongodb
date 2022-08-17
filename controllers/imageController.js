const mongoose = require('mongoose');
const Image = require('../models/imageModel');

exports.uploadimage = async function(req, res, next) {
    console.log(req.body)
    console.log(req.file)

    const ImageFind = await Image.findOne({_id: req.file.id})

    if(ImageFind) {
        return res.status(400).json({
            status: 'fail',
            message: 'Image already exists'
        })
    }

    try {
        await Image.create({
            // caption: req.body.caption,
            filename: req.file.filename,
            fileId: req.file.id,
        })

        let images = await Image.find({})
        res.status(200).json({
            status: 'success',
            data: images
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}