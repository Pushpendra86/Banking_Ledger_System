const mongoose = require("mongoose");

function connectToDB(){
  mongoose.connect(process.env.MONGO_URL)
  .then(()=>console.log("server is connected to DB"))
  .catch((err)=>{
    console.log("error occured", err)
    process.exit(1);
  })

}

module.exports = connectToDB;