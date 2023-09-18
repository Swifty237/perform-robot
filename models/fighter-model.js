import mongoose from "mongoose";

const fighterSchema = mongoose.Schema({
    Name: String,
    NickName: String,
    'Division Title': String,
    'Division Body': [Object],
    'Bio Data': [Object],
    Stats: [Object],
    'Sig. Strikes Landed': String,
    'Sig. Strikes Attempted': String,
    'Takedowns Landed': String,
    'Takedowns Attempted': String,
    'Striking accuracy': String,
    'Takedown Accuracy': String,
    Records: [Object],
    'Last Fight': [Object],
    'Fighter Facts': [],
    'UFC History': [],
    FighterId: Number
});

export default mongoose.model("Fighter", fighterSchema);