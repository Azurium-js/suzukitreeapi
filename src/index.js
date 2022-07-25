const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const config = require('../config.json');

const app = express();
const PORT = 5000;

app.set('trust proxy', 1);

(async () => {
    try {
        let files = await fs.promises.readdir("./src/Routes", { withFileTypes: true });
        files = files
            .filter(file => file.isFile())
            .map(file => file.name);

        for (let i = 0; i < files.length; i++) {
            var route = require(`./Routes/${files[i]}`);
            app.use('/', route);
        }
    } catch (e) {
        console.error("We've thrown! Whoops!", e);
    }
})();

mongoose.connect(config.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log('Loaded database!'));

const whitelist = ["http://localhost:3000"];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by cors'));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true
}
app.use(cors(corsOptions));
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.listen(PORT, () => {
    console.log(`Server initialized on port: http://localhost:${PORT}`);
});