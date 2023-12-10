FROM node:20.10.0
EXPOSE 8080
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prisma/schema.prisma prisma/schema.prisma
RUN npm install
RUN npx prisma generate