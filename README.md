# PrimaryBid URL Shortener

Author: Gary Collins

This is my solution for a URL Shortener tech assessment problem.

## TODO

Extensions to this solutions given more time:

* Add paging to the ShortenedUrls table
* Make the react front end prettier
* Add integration tests for the graphql resolvers with something like InMemoryDB
* Abstract away from MongoDB so it can be swapped out for another DB if needed

## Usage

Prerequisites:
* Install docker

### Full docker via docker-compose

1) Run via docker compose
  1) `cd <project-root>` (if you are not already)
  2) `docker-compose up -d`
  3) Optional: monitor the logs `docker-compose logs -f`
3) Open your browser to http://localhost:3000 and Shorten some URLs!

Optional: Query the graphql directly with GraphiQL at http://localhost:8000/graphql

### Hybrid docker/direct commands

Prerequisites:
* Install node
* Install yarn `npm install -g yarn`
* Install typescript `npm install -g typescript`

1) Run the mongo container from compose
  1) `docker-compose up -d mongo`
2) Run the graphql server
  1) (from project root) `cd server`
  2) `yarn install && yarn run build && yarn run server-start` (you might also need `npm install -g nodemon` for this)
3) Run the react-app server
  1) (from project root) `cd react-app`
  2) `yarn install && yarn run build && yarn run start`
3) Open your browser to http://localhost:3000 and Shorted some URLs!

Optional: Query the graphql directly with GraphiQL at http://localhost:8000/graphql

## Running tests

### React app tests

1) `cd <project-root>/react-app`
2) `yarn install`
3) `yarn run test` (starts the jest watcher)

### GraphQL Server tests

1) `cd <project-root>/server`
2) `yarn install`
3) `yarn run test` (or `yarn run testwatch` if you want to run them for every change on saving a file)

## Tech Used

### React App
* `npx create-react-app --typescript`
  * Creates a nice skeleton project for the react front-end

### Server
* https://github.com/graphql/express-graphql
* concurrently - allows to run several commands concurrently, like our typescript compiler and node server
* nodemon - restarts the node instance when file changes are detected
* https://github.com/ai/nanoid/#custom-alphabet-or-size
  * "A tiny, secure, URL-friendly, unique string ID generator for JavaScript."
* https://github.com/vercel/async-retry
  * A handy little lib for retry with async code with configurable number of retries, timeouts and exponential back off