const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser'); 

const requireAuth = (req,res,next)=>{
   
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token , 'suraj-secret' , (err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.redirect('/')
            }
            else{
                console.log("decoded id : " , decodedToken)
                next()
                
            }
        })
    }
    else{
        res.redirect('/')
    }
}

module.exports = {requireAuth};