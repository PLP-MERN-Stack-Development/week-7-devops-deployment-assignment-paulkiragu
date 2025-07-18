const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_PRODUCTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("mongoDB connected successfully")
    } catch (error) {
        console.error("mongoDB connection error",error.message);
        process.exit(1);
    }
}

module.exports = connectDB;