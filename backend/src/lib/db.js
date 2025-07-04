import mongoose from 'mongoose'

export const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected Successfully")
    } catch (err) {
        console.log("Error connecting to Database", err);
        process.exit(1);
    }
}