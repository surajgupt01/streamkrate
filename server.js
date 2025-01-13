const express = require('express')
const port = 3000;
const path = require('path')
const app = express()
const multer = require('multer');
const connectDB = require('./connection');
const File = require('./model.js')
const http = require('http');
const {User} = require('./model.js')
const SocketIo= require('socket.io')
const server = http.createServer(app)
const io =  SocketIo(server)
const jwt = require('jsonwebtoken')
const {requireAuth} = require('./middleware/authMiddleware.js')
const cookieParser = require('cookie-parser'); 
const validator = require('validator')
const AWS = require('aws-sdk');
const crypto = require('crypto')
const { S3Client, GetObjectCommand , PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config()


app.use(express.static(__dirname + '/public'))

app.set('view engine' , 'ejs');
app.set('views' , path.resolve('./views'))
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(express.json()); // This middleware parses JSON payloads

connectDB()

console.log(process.env.connect)

const storage = multer.memoryStorage()

const upload = multer()



app.get('/' , (req , res)=>{

    res.render('index')

}) 

app.get('/share' , requireAuth , (req,res)=>{
  res.render('fileshare')
 
})

app.get('/LogIn' , (req,res)=>{
    res.render('login')
    // res.send("he")
})

app.get('/signIn' , (req,res)=>{
  res.render('SignUp')
})





app.get('/download' , async(req, res)=>{

    
    try {
        
    
  
        const file =  await File.findOne( {name : req.query.Name});
        if (!file) {
          return res.status(404).send('File not found');
        }
        res.set({
          'Content-Type': file.mimetype,
          'Content-Disposition': `attachment; filename="${file.filename}"`
          
        });

        console.log(file.filename) 
    
        res.send(file.data);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
})



server.listen(port,'0.0.0.0' , ()=>{
    console.log("server started at port:"+port)
})


io.on('connection' , (socket)=>{
  console.log("userr connected")
  
  socket.emit('socketid' , socket.id)
  let newsocketId =  socket.id
  const cookie = socket.handshake.headers.cookie;
  const token = cookie.split('; ').find(c => c.startsWith('jwt=')).split('=')[1];
  console.log("cookie is : "  , token)
  jwt.verify(token , 'suraj-secret' , async(err,decodedToken)=>{
    if(err){
        console.log("error is : ",err.message)
        // res.redirect('/')
    }
    else{
        console.log("decoded id : " , decodedToken.id)
        // next()
        const user = await User.findByIdAndUpdate(decodedToken.id , {socketId : newsocketId} , {new:true})
        console.log(user.email)
        socket.emit('name' , user.email)
        
    }
})

  // let user = User.findOne('')

  socket.on('disconnect' , ()=>{
    console.log("user disconnected")
  })

  socket.on('shareFile' , async({ Sender, Rec , download})=>{
    const id = await User.findOne({email:Rec})
    console.log("id is ::",id)
    // console.log("Receiver id is : ",id.socketId)
    io.to(id.socketId).emit('shareFile', {Sender , download})
  })

})




const handleError =  (err) => {

  console.log("Errr : " , err.message)
  const error = {email: '', password:''};
  
  if(err.message === "Incorrect email"){
    error.email = "that email does not exist"
  }
  if(err.message === "Incorrect password"){
    error.password = "incorrect password"
  }

  if(err.code === 11000){
      error.email = "That email alredy exists"
      return error
  }

  if(err.message.includes('user validation failed')){
      Object.values(err.errors).forEach(({properties})=>{
          console.log("properties are : " , properties)
           error[properties.path] = properties.message
          
      })

  }

  return error
    
}

const createToken = (id)=>{
   
  return jwt.sign({id},'suraj-secret',{expiresIn:maxAge})
}


var maxAge = 24*60*60
app.post('/signIn' , async(req,res)=>{
  try{ 

  const {email,password} = req.body
  console.log("requseted body is " , req.body)
  console.log("requseted body is " , email , " " ,password)
  const user = await User.create({email , password})
  const token = createToken(user._id)
  res.cookie('jwt',token,{httpOnly : true , maxAge :maxAge*1000})
  res.status(201).json({user});
  }
  catch(err){
    console.log("error is : " ,  err);
    const errors = handleError(err)
    console.log(errors)
    // console.log(err.message)
    res.status(400).json({errors})
}

})

app.post('/LogIn' , async(req,res)=>{
  const {email , password}  = req.body;
  console.log("log in cred : " ,req.body)

  try{

    const user = await User.login(email,password)
    const token = createToken(user._id)
    res.cookie('jwt',token,{httpOnly : true , maxAge :maxAge*1000})
    console.log(user)
    res.status(200).json({user})

  }catch(err){
    console.log(err)
    const error = handleError(err)
    console.log(error)
    res.status(400).json({error})
  }
})

AWS.config.update({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

const s3 = new AWS.S3();

// Endpoint to get a pre-signed URL
app.get('/generate', (req, res) => {
 
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  console.log(fileName , " " , fileType)
  const s3Params = {
    Bucket: process.env.Bucket,
    Key: `${fileName}`, // Generate a unique file name
    Expires: 60 * 20, // URL expires in 5 minutes
    ContentType: fileType,
    // ACL: 'public-read', // Optional: Set the ACL permissions
  };


  s3.getSignedUrl('putObject', s3Params, (err, url) => {
    if (err) {
      console.error('Error generating pre-signed URL:', err);
      return res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }

    res.status(200).json({ url });
    console.log(url)
  });
});



const s3Client = new S3Client({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});


app.get('/generate-download-url', async(req, res) => {
  let fileName = req.query.fileName; // File name to be downloaded
  console.log("file to be downloaded : ", fileName)
  fileName = fileName.replace(/^.*[\\/]/, ''); // Removes any local path
  console.log("file to be downloaded : ", fileName)



  const s3Params = {
    Bucket: process.env.Bucket,
    Key: `${fileName}`, // Generate a unique file name
    Expires: 60 * 5, // URL expires in 5 minutes

    // ContentType: fileType,
     ResponseContentDisposition: `attachment; filename="${fileName}"`,
    // ACL: 'public-read', // Optional: Set the ACL permissions
  };

  s3.getSignedUrl('getObject', s3Params, (err, url) => {
    if (err) {
      console.error('Error generating pre-signed URL:', err);
      return res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }

    res.status(200).json({ url });
    console.log(url)
  });
});



















