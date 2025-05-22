import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectdb = async () => {
    try {
        mongoose.set("strictQuery", true);
        const url = process.env.MONGO_URI;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Banco Conectado", mongoose.connection.host);
    } catch (error) {
        console.log(`error: ${error}`);
    }
}