import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import EventModel from './models/event-model.js';
import FighterModel from './models/fighter-model.js';
import UfcNewsModel from './models/ufc-news-model.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

//support parsing of JSON post data
const jsonParser = express.json({ extended: true });
app.use(jsonParser);

app.use(express.static(__dirname));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ACCESS_URI);
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, PATCH");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE");
        //to give access to all the methods provided
        return res.status(200).json({});
    }
    next();
});

const mongoDbUrl = process.env.MONGODB_URI;

// Connexion à la base de données MongoDB
mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: process.env.MONGODB_AUTH_SOURCE,
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DBNAME
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
    console.log('Connecté à MongoDB');
});

let fighters = [];
let eventsData = [];
let eventDetailsData = [];
let fighterDetailsData = [];
let ufcNewsArticles = [];

const getYears = () => {
    const years = [];

    for (let i = 2018; i < 2023; i++) {
        years.push(i);
    }

    return years;
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

    console.log("Fetch api.sportsdata.io...");

    // for (let year of getYears()) {

    // const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + 2023 + '?key=' + process.env.SPORTSDATA_API_KEY;
    // const response = await fetch(apiEventsUrl);
    // const events = await response.json();

    // if (events) {
    //     for (let event of events) {
    //         eventsData.push(event);
    //     }
    // } else {
    //     console.error("Erreur lors de la création de eventsData : " + events);
    // }
    // }

    // for (let event of eventsData) {
    //     const apiEventDetailsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Event/' + event.EventId + '?key=' + process.env.SPORTSDATA_API_KEY;
    //     const response = await fetch(apiEventDetailsUrl);
    //     const eventDetails = await response.json();

    //     console.log(eventDetails);
    //     eventDetailsData.push(eventDetails);
    // }
}

const getRapidapiApiData = async () => {

    console.log("Fetch mma-stats.p.rapidapi.com...");

    // for (let fighter of fighters) {

    //     console.log(fighter);

    //     const apiFighter = 'https://mma-stats.p.rapidapi.com/search?name=' + fighter.FirstName + " " + fighter.LastName;
    //     const options = {
    //         method: 'GET',
    //         headers: {
    //             'X-RapidAPI-Key': process.env.RAPIDAPI_API_KEY,
    //             'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
    //         },
    //         timeout: 300000
    //     };

    //     const response = await fetch(apiFighter, options);
    //     let fighterDetails = await response.json();

    //     if (fighterDetails.error == undefined) {

    //         for (let fighterDetail of fighterDetails.results) {

    //             // Ajout de l'attribut FighterId
    //             fighterDetail.FighterId = fighter.FighterId;
    //             fighterDetailsData.push(fighterDetail);
    //         }
    //     } else {
    //         console.log(fighterDetails.error + " : " + fighter.FirstName + "" + fighter.LastName);
    //     }
    // }
}

const getNewsapiApiData = async () => {

    console.log("Fetch newsapi.org/v2...")

    // const apiUfcNews = 'https://newsapi.org/v2/everything?q=ufc&from=2023&sources=espn';
    // const options = {
    //     method: 'GET',
    //     headers: {
    //         'X-Api-Key': process.env.NEWSAPI_API_KEY,
    //     }
    // };
    // const response = await fetch(apiUfcNews, options);
    // let ufcNews = await response.json();

    // console.log("status : " + ufcNews.status);

    // if (ufcNews.status == "ok") {
    //     ufcNewsArticles = ufcNews.articles;
    // }
}

app.get('/update', async (req, res) => {

    try {

        await getSportsdataApiData();
        // console.log("Premier élément de eventDetailsData : " + eventDetailsData[0]);
        getFigthersNames(eventDetailsData);
        await getRapidapiApiData();
        await getNewsapiApiData();

        // await EventModel.deleteMany();
        // await FighterModel.deleteMany();
        // await UfcNewsModel.deleteMany();

        // await EventModel.insertMany(eventDetailsData);
        // await FighterModel.insertMany(fighterDetailsData);
        // await UfcNewsModel.insertMany(ufcNewsArticles);


        res.json({ message: 'Database updated' })

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

// app.use(ufcDataApiRoutes.apiRouter);

app.listen(process.env.BOT_ACCESS_PORT, () => {
    console.log(process.env.BOT_ACCESS_URI);
});