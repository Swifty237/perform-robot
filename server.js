//var express = require('express');
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ufcDataApiRoutes from './data-api-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

//support parsing of JSON post data
const jsonParser = express.json({ extended: true });
app.use(jsonParser);

app.use(express.static(__dirname));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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

app.get('/', (req, res) => {

    res.json({ "message": "hello world" })
});

app.use(ufcDataApiRoutes.apiRouter);

app.listen(8383, () => {
    console.log("http://localhost:8383");
});