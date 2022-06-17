FROM node:16-alpine
# Adding build tools to make yarn install work on Apple silicaon / arm64 machines
RUN apk add --no-cache py-pip g++ make
WORKDIR /react-app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build
CMD ["react-scripts", "start"]