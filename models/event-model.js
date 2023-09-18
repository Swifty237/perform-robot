import mongoose from "mongoose";

const eventDetailDataSchema = mongoose.Schema({
    EventId: String,
    LeagueId: String,
    Name: String,
    ShortName: String,
    Season: String,
    Day: Date,
    DateTime: Date,
    Status: String,
    Active: Boolean,
    Fights: [Object]
});

export default mongoose.model("Event", eventDetailDataSchema);