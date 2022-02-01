const Mongoose = require('mongoose');
const mongodbPath = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@jjkbotcluster.nybx8.mongodb.net/bot?retryWrites=true&w=majority`;

module.exports = async () => {
    await Mongoose.connect(mongodbPath, { useNewUrlParser: true, useUnifiedTopology: true });

    return Mongoose;
};

Mongoose.connection.on("connected", () => {
    console.log("Connected to database - MongoDB!")
});