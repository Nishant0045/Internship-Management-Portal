const r=require('express').Router();const Application=require('../models/Application');const auth=require('../middleware/auth');
r.post('/:internshipId',auth,async(req,res)=>{try{const a=await Application.create({student:req.user.id,internship:req.params.internshipId});res.status(201).json(a)}catch(e){res.status(409).json({message:'Already applied or invalid internship'})}});
r.get('/my',auth,async(req,res)=>{try{res.json(await Application.find({student:req.user.id}).populate('internship'))}catch(e){res.status(500).json({message:e.message})}});
r.patch('/:id/status',auth,async(req,res)=>{if(req.user.role!=='admin')return res.status(403).json({message:'Admin only'});res.json(await Application.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true}))});
module.exports=r;
