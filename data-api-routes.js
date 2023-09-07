import express, { json, response } from 'express';
import mongoose from 'mongoose';
import EventModel from './models/event-model.js';
import FighterModel from './models/fighter-model.js';
import UfcNewsModel from './models/ufc-news-model.js';
import dotenv from 'dotenv';
dotenv.config();

const apiRouter = express.Router();

const mongoDbUrl = process.env.MONGODB_URI;

// Connexion à la base de données MongoDB
mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: process.env.AUTH_SOURCE,
    user: process.env.DB_USER,
    pass: process.env.PASS,
    dbName: process.env.DBNAME
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
let ufcNewsArticles = [];

const getYears = () => {
    for (let i = 2018; i <= 2023; i++) {
        years.push(i);
    }
}

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

const getSportsdataApiData = async () => {

    getYears();

    for (let year of years) {

        const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + year + '?key=' + process.env.SPORTSDATA_API_KEY2;
        const response = await fetch(apiEventsUrl);
        const events = await response.json();

        for (let event of events) {
            eventsData.push(event);
        }
    }

    for (let event of eventsData) {
        const apiEventDetailsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Event/' + event.EventId + '?key=' + process.env.SPORTSDATA_API_KEY2;
        const response = await fetch(apiEventDetailsUrl);
        const eventDetails = await response.json();
        eventDetailsData.push(eventDetails);
    }
}

const getRapidapiApiData = async () => {

    for (let fighter of fighters) {

        const apiFighter = 'https://mma-stats.p.rapidapi.com/search?name=' + fighter.FirstName + " " + fighter.LastName;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_API_KEY,
                'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
            }
        };
        const response = await fetch(apiFighter, options);
        let fighterDetails = await response.json();

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
}

const getNewsapiApiData = async () => {

    const apiUfcNews = 'https://newsapi.org/v2/everything?q=ufc&from=2023&sources=espn';
    const options = {
        method: 'GET',
        headers: {
            'X-Api-Key': process.env.NEWSAPI_API_KEY,
        }
    };
    const response = await fetch(apiUfcNews, options);
    let ufcNews = await response.json();

    console.log("status : " + ufcNews.status);

    if (ufcNews.status == "ok") {
        ufcNewsArticles = ufcNews.articles;
    }
}

// Route pour mettre à jour les données de la base données mongodb
apiRouter.route('/update').
    get(async (req, res) => {

        try {

            await getSportsdataApiData();
            getFigthersNames(eventDetailsData);
            await getRapidapiApiData();
            await getNewsapiApiData();

            await EventModel.deleteMany();
            await FighterModel.deleteMany();
            await UfcNewsModel.deleteMany();

            await EventModel.insertMany(eventDetailsData);
            await FighterModel.insertMany(fighterDetailsData);
            await UfcNewsModel.insertMany(ufcNewsArticles);


            res.json({ message: 'Database updated' })

            years = [];
            eventsData = [];
            eventDetailsData = [];
            fighters = [];
            fighterDetailsData = [];
            ufcNewsArticles = [];

        } catch (error) {
            console.error('Erreur lors de la mise à jour :', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

export default { apiRouter };