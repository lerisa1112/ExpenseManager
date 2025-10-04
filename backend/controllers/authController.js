import User from "../models/User.js";
import Company from "../models/Company.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req,res)=>{
  try{
    const { name, email, password, companyName, country } = req.body;

    let company = await Company.findOne({ name: companyName });
    if(!company){
      company = await Company.create({ name: companyName, country, currency: country === "India" ? "INR" : "USD" });
    }

    let role = "Employee";
    if(!company.admin){
      role = "Admin"; // first user is Admin
    }

    const user = await User.create({
      name, email, password, role, company: company._id
    });

    if(role==="Admin"){
      company.admin = user._id;
      await company.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

export const login = async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("company");
    if(user && await user.matchPassword(password)){
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }else{
      res.status(401).json({ message: "Invalid credentials" });
    }
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}
