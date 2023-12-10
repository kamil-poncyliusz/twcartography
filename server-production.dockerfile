FROM node:20.10.0
EXPOSE 8080
COPY . /app
WORKDIR /app
RUN npm install
RUN npx tsc