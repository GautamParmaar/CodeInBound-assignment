const mongoose = require('mongoose');
const {Schema}=mongoose;


const UserSchema = new Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
     },
   name:{
    type:String,
    required:true

   
   },
   email:{
    type:String,
    required:true,

  
    unique:true
   },
   password:{
    type:String,
    required:true,

    
    
   }
   
   

  });
  // module.exports=mongoose.model("notes",UserSchema);

const User=mongoose.model("user",UserSchema);
User.createIndexes();
  module.exports=User
//   user is name of model & UserSchema is above Schema