// require('dotenv').config({ path: './env' })
import * as dotenv from 'dotenv';

dotenv.config()
import connectDB from "./db/index.js";
import { app } from './app.js';


connectDB().then(() => {
    app.on('error', (error) => {
        console.log(error);
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log("app listening");
    })
}).catch((err) => {
    console.log("db connection faill");
})
