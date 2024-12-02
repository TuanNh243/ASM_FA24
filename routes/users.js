var express = require('express');
var router = express.Router();
const JWT  = require('jsonwebtoken');
const config = require('../util/TokenConfig');
const userModel = require('../models/userModel');
/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    const token = req.header("Authorization").split(' ')[1];

    if(token){
        JWT.verify(token, config.SECRETKEY, async function (err, id){
      if(err){
        res.status(403).json({"status": 403, "err": err});
      }else{
        const user = await userModel.find();
        res.json(user);
      }
    });
    }else{
      res.status(401).json({"status": 401});
      }
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

router.post('/login',async function(req, res){
  try {
    const {username,password} = req.body;
    const checkUser = await userModel.findOne({ username: username,password: password });
    if(checkUser == null){
      res.status(400).json({status:false,message:"Tên đăng nhập hoặc mật khẩu không đúng"});
    }else{
      var token = JWT.sign({username: username},config.SECRETKEY,{expiresIn:'360s'});
      var refreshToken = JWT.sign({username: username},config.SECRETKEY,{expiresIn:'1d'});
      res.json({status:true,message:"Đăng nhập thành công",token:token, refreshToken:refreshToken});
    }
  }catch (e) {
    res.status(400).json({status:false,message:"Error"});
  }
  } );

router.post('/add',async (req, res) => {
  try {
    const{username,password} = req.body;
    const newUser = {username:username,password:password};
    await userModel.create(newUser);
    res.json({ status: true, message: 'User added successfully!' });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;
