const Mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async()=>{

    try{

        const con = await Mongoose.connect(process.env.connect
        , {

            // useNewUrlParser : true,
            // useUnifiedTopology : true,
            // // useFindAndModify : false,
            // // useCreateIndex : true

        })

        console.log(`MongoDB connected : ${con.connection.host}`)
    }catch(err)
    {

        console.log(err);
        process.exit(1)
    
        
    }

    

    }

    module.exports = connectDB