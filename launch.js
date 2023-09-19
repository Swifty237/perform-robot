import mongoose from 'mongoose';
import EventModel from './models/event-model.js';
import FighterModel from './models/fighter-model.js';
import UfcNewsModel from './models/ufc-news-model.js';
import dotenv from 'dotenv';
dotenv.config();

let fighters = [];
let eventsData = [];
let eventDetailsData = [];
let fighterDetailsData = [];
let ufcNewsArticles = [];

const getYears = () => {
    const years = [];

    for (let i = 2021; i < 2023; i++) {
        years.push(i);
    }

    return years;
}

const getFigthersNames = (tabJson) => {

    if (tabJson != []) {
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
    } else {
        console.log("eventDetailsData is empty");
    }
}

const getSportsdataApiData = async () => {

    console.log("Fetch api.sportsdata.io...");

    // for (let year of getYears()) {

    const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + 2023 + '?key=' + process.env.SPORTSDATA_API_KEY;
    const response = await fetch(apiEventsUrl);
    const events = await response.json();

    if (events) {
        for (let event of events) {
            eventsData.push(event);
        }
    } else {
        console.error("Erreur lors de la création de eventsData : " + events);
    }
    // }

    for (let event of eventsData) {
        const apiEventDetailsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Event/' + event.EventId + '?key=' + process.env.SPORTSDATA_API_KEY;
        const response = await fetch(apiEventDetailsUrl);
        const eventDetails = await response.json();

        eventDetailsData.push(eventDetails);
    }
}

const getRapidapiApiData = async () => {

    console.log("Fetch mma-stats.p.rapidapi.com...");

    for (let fighter of fighters) {

        console.log(fighter);

        const apiFighter = 'https://mma-stats.p.rapidapi.com/search?name=' + fighter.FirstName + " " + fighter.LastName;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_API_KEY,
                'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
            },
            timeout: 300000
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
            console.log(fighterDetails.error + " : " + fighter.FirstName + "" + fighter.LastName);
        }
    }
}

const getNewsapiApiData = async () => {

    console.log("Fetch newsapi.org/v2...");

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

const launchUpdateDatabase = async () => {

    try {

        // await getSportsdataApiData();
        // getFigthersNames(eventDetailsData);
        // await getRapidapiApiData();
        // await getNewsapiApiData();

        if (process.env.LOCAL_MONGODB_USER && process.env.LOCAL_MONGODB_URI && process.env.LOCAL_MONGODB_PASSWORD) {

            const mongoDbUrl = process.env.LOCAL_MONGODB_URI;

            // Connexion à la base de données MongoDB
            mongoose.connect(mongoDbUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                authSource: process.env.MONGODB_AUTH_SOURCE,
                user: process.env.LOCAL_MONGODB_USER,
                pass: process.env.LOCAL_MONGODB_PASSWORD,
                dbName: process.env.LOCAL_MONGODB_DBNAME
            });

            const db = mongoose.connection;

            db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
            db.once('open', () => {
                console.log('Connecté à MongoDB => local');
            });

            // await EventModel.deleteMany();
            // await FighterModel.deleteMany();
            // await UfcNewsModel.deleteMany();

            // await EventModel.insertMany(eventDetailsData);
            // await FighterModel.insertMany(fighterDetailsData);
            // await UfcNewsModel.insertMany(ufcNewsArticles);

            db.close();

        } else {

            const mongoDbUrl = process.env.PROD_MONGODB_URI;

            // Connexion à la base de données MongoDB
            mongoose.connect(mongoDbUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                authSource: process.env.MONGODB_AUTH_SOURCE,
                dbName: process.env.PROD_MONGODB_DBNAME
            });

            const db = mongoose.connection;

            db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
            db.once('open', () => {
                console.log('Connecté à MongoDB => Prod');
            });

            // await EventModel.deleteMany();
            // await FighterModel.deleteMany();
            // await UfcNewsModel.deleteMany();

            // await EventModel.insertMany(eventDetailsData);
            // await FighterModel.insertMany(fighterDetailsData);
            // await UfcNewsModel.insertMany(ufcNewsArticles);

            db.close();
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
}

export default launchUpdateDatabase;