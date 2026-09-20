const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 company:{type:String,required:true},
 role:{type:String,required:true},
 type:{type:String,required:true},
 skills:[String],
 location:{type:String,required:true},
 description:String,
 stipend:String,
 postedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});
module.exports=mongoose.model('Internship',schema);
