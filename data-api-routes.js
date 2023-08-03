import express, { json, response } from 'express';
import mongoose from 'mongoose';
import EventModel from './models/event-model.js';
// import EventDetailsModel from './models/event-details-model.js';
import FighterModel from './models/fighter-model.js';

const apiRouter = express.Router();

const mongoDbUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";

// Connexion à la base de données MongoDB
mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    user: "user_admin",
    pass: "password",
    dbName: "test_db"
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
    console.log('Connecté à MongoDB');
});

let years = [];
let eventsData = [];
let eventDetailsData = [];
let fighters = [];
let fighterDetailsData = [];

const getYears = () => {
    for (let i = 2018; i <= 2023; i++) {
        years.push(i);
    }
}

// const getFirstElement = (tab) => {
//     if (tab.length > O) {

//         console.log("length : " + tab.length)

//         return tab[0];
//     }
// }

const getFigthersNames = (tabJson) => {

    tabJson.map(tabElt => {

        tabElt.Fights.map(fightElt => {

            fightElt.Fighters.map(fighter => {

                const found = fighters.find(elt => elt.FighterId === fighter.FighterId);

                if (!found) {
                    const newElement = {
                        FighterId: fighter.FighterId,
                        FirstName: fighter.FirstName,
                        LastName: fighter.LastName
                    }
                    fighters.push(newElement);
                }
            })
        })
    })
}

// Route pour mettre à jour les données depuis l'API
apiRouter.route('/update').
    get(async (req, res) => {
        getYears();

        try {

            for (let year of years) {

                // const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + 2014 + '?key=bf29bfe82bb140c6a0e4f1b59f0dde6e';
                // const response = await fetch(apiEventsUrl);
                // const events = await response.json();

                for (let event of events) {
                    eventsData.push(event);
                }

                const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + year + '?key=5b889eb1afe345c884ebe685fcf2554d';
                const response = await fetch(apiEventsUrl);
                const events = await response.json();

                for (let event of events) {
                    eventsData.push(event);
                }
            }

            for (let event of eventsData) {
                const apiEventDetailsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Event/' + event.EventId + '?key=5b889eb1afe345c884ebe685fcf2554d';
                const response = await fetch(apiEventDetailsUrl);
                const eventDetails = await response.json();
                eventDetailsData.push(eventDetails);
            }

            years = [];

            getFigthersNames(eventDetailsData);

            for (let fighter of fighters) {

                const apiFighter = 'https://mma-stats.p.rapidapi.com/search?name=' + fighter.FirstName + " " + fighter.LastName;
                const options = {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': '9f91682347msh5c47ec9b9a7f681p1d353djsn0f9e497aefe3',
                        'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
                    }
                };
                const response = await fetch(apiFighter, options);
                let fighterDetails = await response.json();

                console.log(fighterDetails.results);

                if (fighterDetails.error == undefined) {

                    for (let fighterDetail of fighterDetails.results) {

                        // Ajout de l'attribut FighterId
                        fighterDetail.FighterId = fighter.FighterId;
                        fighterDetailsData.push(fighterDetail);
                    }
                } else {
                    console.log(fighterDetails.error + "" + fighter.FirstName + "" + fighter.LastName);
                }
            }

            console.log(fighterDetailsData);

            await EventModel.deleteMany();
            await FighterModel.deleteMany();

            await EventModel.insertMany(eventDetailsData);
            await FighterModel.insertMany(fighterDetailsData);

            eventsData = [];
            eventDetailsData = [];
            fighters = [];
            fighterDetailsData = [];

            res.json({ message: 'Database updated' })

        } catch (error) {
            console.error('Erreur lors de la mise à jour :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

export default { apiRouter };