const jwt=require('jsonwebtoken');
const generateToken=(user)=>jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:'2h'})
module.exports=generateToken;