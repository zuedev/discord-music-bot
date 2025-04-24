FROM node:22-alpine
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN apk -U add yt-dlp
CMD ["npm", "start"]