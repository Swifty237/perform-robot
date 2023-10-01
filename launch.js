import mongoose from 'mongoose';
import EventModel from './models/event-model.js';
import FighterModel from './models/fighter-model.js';
import UfcNewsModel from './models/ufc-news-model.js';
import getMongooseConnection from './utils/database.js';
import {
    FighterIdentities,
    getYears,
    getMongodbEvents,
    getFigtherIds,
    getMongodbFighters
} from './utils/fucntions.js'
import dotenv from 'dotenv';

dotenv.config();
getMongooseConnection();

const mongodbEvents = await getMongodbEvents();

let eventsData = [];
let eventDetailsData = [];
let fighterDetailsData = [];
let ufcNewsArticles = [];


const getSportsdataApiData = async () => {

    console.log("Fetch api.sportsdata.io...");

    // for (let year of getYears()) {

    const apiEventsUrl = 'https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/' + 2023 + '?key=' + process.env.SPORTSDATA_API_KEY;
    const response = await fetch(apiEventsUrl);
    const events = await response.json();

    if (mongodbEvents[0].EventId) {
        const mongodbEventIds = [];

        for (let mongodbEvent of mongodbEvents) {
            mongodbEventIds.push(mongodbEvent.EventId)

            if (events[0].EventId) {
                for (let event of events) {

                    if (!mongodbEventIds.includes(event.EventId)) {
                        eventsData.push(event);
                    }
                }
            }
        }

    } else {

        if (events[0].EventId) {
            for (let event of events) {
                eventsData.push(event);
            }

        } else {
            console.error("Erreur lors de la création de eventsData : " + events);
        }
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

    for (let fighter of FighterIdentities(eventDetailsData)) {

        console.log("fighter : " + fighter.FirstName + " " + fighter.LastName);

        const apiFighter = 'https://mma-stats.p.rapidapi.com/search?name=' + fighter.FirstName + " " + fighter.LastName;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_API_KEY,
                'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
            },
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

    const mongodbFighters = await getMongodbFighters();

    try {

        await getSportsdataApiData();
        await getRapidapiApiData();
        await getNewsapiApiData();

        for (let fighter of fighterDetailsData) {
            if (getFigtherIds(mongodbFighters).includes(fighter.FighterId)) {
                await FighterModel.deleteOne(fighter);
            }
        }

        await UfcNewsModel.deleteMany();

        await EventModel.insertMany(eventDetailsData);
        await FighterModel.insertMany(fighterDetailsData);
        await UfcNewsModel.insertMany(ufcNewsArticles);

    } catch (error) {
        console.error('Erreur lors de la mise à jour :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
}

export default launchUpdateDatabase;