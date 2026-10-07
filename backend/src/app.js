const dotenv = require('dotenv');
const path = require('path');

// Load environment variables centrally for the entire application
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MediaSeeker API',
      version: '1.0.0',
      description: 'Documentation interactive de l\'API MediaSeeker REST',
      contact: {
        name: 'Thomas .C',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur local de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const indexRouter = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { initDb } = require('./db/database');

// Initialize database schema
initDb();

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// SWAGGER API DOCS
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MAIN ROUTER
app.use('/', indexRouter);

// Catch 404 (Route not found) and pass to error handler
app.use((req, res, next) => {
  next(createError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);


// const WORKER_URL = process.env.WORKER_URL;

// async function proxiedFetch(targetUrl, options = {}) {
//   const url = `${WORKER_URL}?url=${encodeURIComponent(targetUrl)}`;
//   return fetch(url, options);
// }

// async function searchTorrents(query='The summer i turned pretty') {
//   const target = `https://c411.org/api?t=search&apikey=STFU&q=${encodeURIComponent(query)}&o=json&limit=100&offset=0`;
  
//   const res = await proxiedFetch(target, {
//     method: "GET",
//     headers: {
//       "Accept": "application/json"
//     }
//   });

//   const data = await res.json();
//   console.log(data);
//   console.log(data.channel.item);
// }
// async function testWorkerIp() {
//   // On demande au Worker de fetcher le service d'IP
//   const res = await proxiedFetch("https://api.iplocate.io/json");
//   const data = await res.json();
  
//   console.log("IP publique de sortie :", data.ip);
// }

// testWorkerIp();

// searchTorrents("The summer i turned pretty");

module.exports = app;
