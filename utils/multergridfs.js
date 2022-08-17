//*initialize gridfs storage engine

const {GridFsStorage} = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const storage = new GridFsStorage({
    url: process.env.DB_CONNECTION_STRING,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            }
            );
        });
    }
})

module.exports = multer({ storage });