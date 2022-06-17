import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import cors from 'cors';
import { urlShortenerGraphQlSchema, urlShortenerGraphQlSchemaRoot } from './graphql/UrlShortenerGraphQlSchema';
import dotenv from 'dotenv';
import { connectToDatabase } from './graphql/dbConnector';

dotenv.config();

const mongoDbHost = process.env.MONGODB_HOST || "localhostIndex";
const mongoDbPort = process.env.MONGODB_PORT || 27018;
const mongoDbDatabase = process.env.MONGODB_DB || "urlShortener";
const mongoDbConnectUrl = `mongodb://${mongoDbHost}:${mongoDbPort}/${mongoDbDatabase}`;
connectToDatabase(mongoDbConnectUrl);

const port = process.env.PORT || 8000;

const app: Express = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.post(
    '/graphql',
    graphqlHTTP({
        schema: urlShortenerGraphQlSchema,
        rootValue: urlShortenerGraphQlSchemaRoot,
        graphiql: false,
    }),
);

app.get(
    '/graphql',
    graphqlHTTP({
        schema: urlShortenerGraphQlSchema,
        graphiql: true,
    }),
);

app.listen(port, () => {
    console.log(`[server]: URL Shortener Server is running at https://localhost:${port}`);
});

