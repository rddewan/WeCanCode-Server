import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';


// environment variables
dotenv.config({
    path: '.env'
});

const DB: string = process.env.MONGO_DB?.replace('<PASSWORD>', process.env.MONGO_DB_PASSWORD || '') as string;
mongoose.connect(DB)
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch((error) => console.log(error));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default server;
