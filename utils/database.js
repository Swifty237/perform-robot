import mongoose from 'mongoose';

const getMongooseConnection = () => {

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

        return db;

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

        return db;
    }
}

export default getMongooseConnection;