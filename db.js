const mongoose=require('mongoose');
const mongURL="mongodb://127.0.0.1:27017/Assignment"
const connectToMongo=()=>{
    mongoose
  .connect(mongURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));
}

module.exports=connectToMongo;