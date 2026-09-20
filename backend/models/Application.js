const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 internship:{type:mongoose.Schema.Types.ObjectId,ref:'Internship',required:true},
 status:{type:String,enum:['Applied','Shortlisted','Selected','Rejected'],default:'Applied'}
},{timestamps:true});
schema.index({student:1,internship:1},{unique:true});
module.exports=mongoose.model('Application',schema);
