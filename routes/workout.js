//require('dotenv').config();  // Corrected from 'dotnev' to 'dotenv'

const express = require("express")
const router = express.Router()

router.get('/',(req,res)=> {
    req.json({msg:'GET all workouts'})
})

router.get('/:id',(res,req)=>{
    res.json({msg:'GET single'})
})


router.delete('/:id',(req,res)=> {
    res.json({msg:'DELETE a workout'})
})
router.patch('/:id',(req,res)=> {
    res.json({msg:'UPDATE a workout'})
})
module.exports=router