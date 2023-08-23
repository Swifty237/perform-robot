import mongoose from "mongoose";

const ufcNewsDataSchema = mongoose.Schema({
    source: {
        id: String,
        name: String
    },
    author: String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: String,
    content: String
});

export default mongoose.model("UfcNews", ufcNewsDataSchema);