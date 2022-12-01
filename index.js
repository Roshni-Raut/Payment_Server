require('dotenv').config({path:"./.env"});
const cors=require("cors")
const express=require("express")
const stripe=require("stripe")(`${process.env.STRIPE_SECRET_KEY}`)
const bodyParser=require("body-parser")
const app=express()

const port=8282;

//middlewares
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


//listen
app.listen(process.env.PORT||4000,async()=>{
    console.log("server started ")
})

//routes console.log(new Date(parseInt(date, 10) * 1000))
app.get("/",(req,res)=>{
    res.send(" online ")
})
app.post("/Allpaymentlist",cors(), async (req,res)=>{
    const paymentIntents=await stripe.paymentIntents.list();
    var data=[]
    for(var i=0 ;i< paymentIntents.data.length;i++){
        var {id,amount,description,status,receipt_email,created}=paymentIntents.data[i];
        data.push({transaction_id:id,amount:amount,description:description,status:status,receipt_email:receipt_email,created: new Date(parseInt(created,10)*1000)})
    }
    res.json({paymentIntents:data})
})
app.post("/paymentlist",cors(), async (req,res)=>{
    const {email}=req.body
    const paymentIntents=await stripe.paymentIntents.list();
    var data=[]
    for(var i=0 ;i< paymentIntents.data.length;i++){
        var {id,amount,description,status,receipt_email,created}=paymentIntents.data[i];
        if(email===receipt_email)
            data.push({transaction_id:id,amount:amount,description:description,status:status,receipt_email:receipt_email,created: new Date(parseInt(created,10)*1000)})
    }
    res.json({paymentIntents:data})
})

app.post("/payment",cors(), async (req,res)=>{
    const {amount,id,email}=req.body
    try{
        const payment=await stripe.paymentIntents.create({
            amount,
            currency:"inr",
            payment_method:id,
            description:"Monthly Maintenance",
            receipt_email:email,
            confirm: true
        })
        res.json({
            message:"Payment successful",
            success: true,
            transaction_id: payment.id,
            date: new Date(parseInt(payment.created,10)*1000),
            amount:payment.amount/100,
        })
        
    }catch(error){
        console.log("error: ",error)
        res.json({
            message:"Payment failed",
            success:false
        })
    }
})