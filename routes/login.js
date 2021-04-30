const express= require('express');
const router=express.Router();
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const bcryptjs=require('bcryptjs');
const auth=require('../auth');
// router.use(express.static("public"));

const loginModel=require('../models/loginModel');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./public/scratch');
  }
   
  localStorage.setItem('myFirstKey', 'myFirstValue');

router.post('/register',function(req,res){
    const newRegister = new loginModel({
        _id:new mongoose.Types.ObjectId(),
        name: req.body.name,
        userName:req.body.userName,
        gitID:'',
        codeforcesID:'',
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        city:'',
        password: bcryptjs.hashSync(req.body.password,10)
    });
    loginModel.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length>0)
        res.json("User already existS").status(200);
        else{
            newRegister.save();
            console.log("User registered successfuly");
            res.redirect('/').status(200);
        }
    });
})

let userid= '5f159f594efd4b239416ac89';


router.post('/enter', function(req, res){
    const email=req.body.email;
    loginModel.findOne({email:req.body.email})
    .exec()
    .then(user=>{
    console.log(user);
   if(user==null)
   {
    res.send("User Does not exists").status(401);
   }
   else
   {
       if(bcryptjs.compareSync(req.body.password,user.password))
       {
           const token=jwt.sign(
               {
                   email:user.email,
                   _id:user._id
               },
               'covid',
               {
                expiresIn:'1h'
               }
           );
           console.log({
               "message":"Authentication Successfull.",
               "token":token
           });
           localStorage.setItem('userName',email);
           userid=(user._id).toString();
           res.redirect('/home.html');
        }
        else{
            res.send("Wrong Password Entered").status(401);
        }
   }
})
.catch(err=>{
    res.json(err).status(200);
})
})
router.get('/:email/:password', function(req,res){
    const emailId = req.params.email;
    const pass = req.params.password;
    loginModel.find({email: emailId})
    .exec()
    .then(details =>{
        if(details.length==0){
            res.json(false).status(200);
        }
        else if(pass===details[0].password)
        {
            res.redirect("/medicalPageLoad");
            res.json(true).status(200);
        }
        else{
            res.json(false).status(200);
        }
    })
})

// router.get('/details2',function(res,req){
//     // loginModel.find({email:'fk@gmail.com'})
//     loginModel.find({_id:userid})
//     .exec()
//     .then(logins=>{
//         console.log(logins);
//         res.json(logins.cart).status(200);
//     })
// })

router.get('/details',async(req,res)=>{
    const results=await loginModel.find({_id:userid});
    console.log(results[0].password)
    return res.send({arrList:results})
})


router.use('/update', function (req, res) {
    gitID = req.body.gitID,
    codeforcesID = req.body.codeforcesID,
    // kaggleID = req.body.kaggleID
    loginModel.updateMany({ _id: userid }, { gitID: gitID, codeforcesID:codeforcesID}).exec()
        .catch(err => { console.log(err) })
})

router.get('/showSkill',async(req,res)=>{
    const results=await loginModel.find({_id:userid}).exec()
    .catch(err=>{console.log(err)})
    console.log(results[0].password)
    return res.send({arrList:results})
})

router.get('/welcome',async(req,res)=>{
    const results=await loginModel.find({_id:userid})
    console.log(results[0].name);
    return res.send(results[0]);
})


module.exports=router;