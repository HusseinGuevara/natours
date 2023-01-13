const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env'});
const app = require('./app');

process.on('uncaughtException', err => {
    console.log('Uncaught Exeption!');
    console.log(err.name, err.message);
    process.exit(1);
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => { console.log('DB connectiion successful');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection!')
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});



