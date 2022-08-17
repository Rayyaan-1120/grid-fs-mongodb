const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    age:{
        type:Number,
        // required:true,
    },
    photo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Image',
        // required:true,
    }
})

userSchema.pre('save', async function (next) {
    //only run when the password is modified
    this.password = await bcrypt.hash(this.password, 12)

    await this.populate('photo')
    next()

})

userSchema.methods.correctPassword = async function (candidatepassword, userpassword) {
    return await bcrypt.compare(candidatepassword, userpassword)
}

// userSchema.pre(/^find/, async function (next) {
//     await this.populate('photo')
//     next()
// })

const User = mongoose.model('User',userSchema)

module.exports = User