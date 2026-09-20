const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

exports.register=async(req,res)=>{
 try{
  const {name,email,password}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:'All fields are required'});
  if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});
  const user=await User.create({name,email,password:await bcrypt.hash(password,10)});
  res.status(201).json({token:jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'}),user:{name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message})}
};
exports.login=async(req,res)=>{
 try{
  const {email,password}=req.body,user=await User.findOne({email});
  if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:'Invalid email or password'});
  res.json({token:jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'}),user:{name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message})}
};
