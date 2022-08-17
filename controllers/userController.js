const mongoose = require("mongoose");
const Image = require("../models/imageModel");
const User = require("../models/userModel");
const fs = require("fs");
const Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

const connect = mongoose.createConnection(process.env.DB_CONNECTION_STRING);

let gfs, gridfsBucket;

connect.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "uploads",
  });

  gfs = Grid(connect.db);
  gfs.collection("uploads");
});

// let gfs;
console.log("userController.js", gfs);

exports.signupuser = async function (req, res, next) {
  const { fullname, email, password, age } = req.body;


  if (!fullname || !email || !password || !age) {
    console.log("missing fields");
    return res.status(400).json({
      status: "fail",
      message: "Please provide all the details",
    });
  }

  const ImageFind = await Image.findOne({ _id: req.file.id });

  if (ImageFind) {
    return res.status(400).json({
      status: "fail",
      message: "Image already exists",
    });
  }

  try {
    let singleimage = await Image.create({
      // caption: req.body.caption,
      filename: req.file.filename,
      fileId: req.file.id,
    });

    const user = await User.create({
      fullname,
      email,
      password,
      age,
      photo: new mongoose.Types.ObjectId(singleimage._id),
    });

    gfs?.files.find({ filename: user?.photo?.filename }).toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            status: "fail",
            message: "File not found",
          });
        }
        const readstream = gridfsBucket?.openDownloadStream(files[0]._id);
        readstream.on("data", (chunk) => {
          return res.status(200).json({
            status: "success",
            data: {
              _id: user._id,
            fullname: user.fullname,
            email: user.email,
            age: user.age,
            photo: user.photo,
            image: chunk.toString("base64"),
          },
          });
        });
      });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getallusers = async function (req, res, next) {
  try {
    const users = await User.find({})
      .select("-password -__v")
      .populate("photo");
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
  // res.status(200).json({
  //     status: 'success',
  //     msg:"hh8ehh8h"
  // })
};

exports.loginuser = async function (req, res, next) {
  const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Please provide all the details",
//     });
//   }
  try {
    const user = await User.findOne({ email }).populate("photo");
    if (!user) {
      console.log("user not found");
      return res.status(400).json({
        status: "fail",
        message: "User not found",
      });
    }
    const isMatch = await user.correctPassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    gfs?.files.find({ filename: user?.photo?.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        
        return res.status(404).json({
          status: "fail",
          message: "File not found",
        });
      }
      const readstream = gridfsBucket?.openDownloadStream(files[0]._id);
      readstream.on("data", (chunk) => {
      return  res.status(200).json({
          status: "success",
          data: {
            _id: user._id,
          fullname: user.fullname,
          email: user.email,
          age: user.age,
          photo: user.photo,
          image: chunk.toString("base64"),
        },
        });
      });
    });

   
  } catch (err) {
   return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.searchusers = async function (req, res, next) {
  const { search, filtertype } = req.query;

  if (!search) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide search query",
    });
  }

  const filterobj = filtertype
    ? { [filtertype]: { $regex: search, $options: "i" } }
    : { fullname: { $regex: search, $options: "i" } };

  console.log(filterobj, "d");

  try {
    const users = await User.find(filterobj)
      .select("-password -__v")
      .populate("photo");
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getSingleUser = async function (req, res, next) {
  const { id, filename } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide user id",
    });
  }

  try {
    const user = await User.findById(id).select("-password -__v");
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "User not found",
      });
    }

    gfs?.files.find({ filename: filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          status: "fail",
          message: "File not found",
        });
      }

      const readstream = gridfsBucket?.openDownloadStream(files[0]._id);
      readstream.on("data", (chunk) => {

    //    res.status(200).json({
        //   status: "success",
        //   data: {
        //       _id: user._id,
        //     fullname: user.fullname,
        //     email: user.email,
        //     age: user.age,
        //     photo: user.photo,
        //     image: chunk.toString("base64"),
        //   },
        //   // image: chunk.toString('base64')

        //   // data: {
        //   //     ...user,
        //   //     image: chunk.toString('base64')
        //   // },
        // });
      });
    });
    // console.log(filename)
    // const readstream = gfs.create({filename: filename})
    // readstream.on('error', (err) => {
    //     console.log(err)
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err.message
    //     })
    // })

    // readstream.on('data', (chunk) => {
    //     res.status(200).json({
    //         status: 'success',
    //         // data: {...chunk,user},
    //     })
    // })
    //

    // res.status(200).json({
    //     status: 'success',
    //     data: user
    // })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
