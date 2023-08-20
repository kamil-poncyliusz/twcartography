FROM node:20.5.1
EXPOSE 8080
COPY . /app
WORKDIR /app
RUN mv .env.dist .env
RUN npm install
RUN npx tsc