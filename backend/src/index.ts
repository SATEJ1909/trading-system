import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import mongoose from 'mongoose'
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000
async function main(){
    await mongoose.connect(process.env.DATABASE_URL as string)
    app.listen(PORT , ()=>{
        console.log(`Server running on port ${PORT}`)
    })
}

main();