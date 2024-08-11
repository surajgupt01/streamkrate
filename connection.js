const Mongoose = require('mongoose')

const connectDB = async()=>{

    try{

        const con = await Mongoose.connect( "mongodb+srv://admin:admin123@cluster0.pqo2j38.mongodb.net/?retryWrites=true&w=majority"
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