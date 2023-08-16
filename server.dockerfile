FROM node:latest
EXPOSE 8080
COPY . /app
WORKDIR /app
RUN mv .env.dist .env
RUN npm install
RUN npx tsc
# RUN npx prisma db push
# RUN npm run create-admin
# RUN npm run start
