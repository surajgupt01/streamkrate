const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')
const { required } = require('nodemon/lib/config')

const schema = new mongoose.Schema({

    name:{
        type: String,
        required : true,
        
    },

    id:{
        type : String,
        require:true

    },

    
        // filename: String,
        // mimetype: String,
        // data: Buffer
    
})


const user = new mongoose.Schema({
    email :{
        type: String,
        required : [true , 'Please enter email'],
        validate: [isEmail, "please enter correct email"],
        lowercase : true,
        unique : true,

    },
    password :{
        type: String,
        required : [true ,'Please enter password'],
        minlength : [6,'Min len of password is 6'],

    },
    socketId:{
        type : String,
      
        unique:true,

    },
    file:{
        data:Buffer,
        mimetype : String,
        filename:String

    },
    contacts :{
        type : String,
        lowercase : true
    }
    
})

user.pre('save' , async function (next){

    const salt = await bcrypt.genSalt();
    this.password =  await bcrypt.hash(this.password,salt)
    next()
   
})

user.statics.login = async function(email,password){
    const temp = await this.findOne({email})
    
    if(temp){

       const auth = await bcrypt.compare(password,temp.password)
     
       if(auth){
        return temp;
       }
       throw Error("Incorrect password")
    }
    throw Error( "Incorrect email")
}

const File = mongoose.model('File', schema);

const User = mongoose.model('user' , user)

module.exports = {File,User}
