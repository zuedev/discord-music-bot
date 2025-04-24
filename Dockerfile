FROM node:22
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN add-apt-repository ppa:tomtomtom/yt-dlp && \
    apt update && \
    apt install yt-dlp -y
CMD ["npm", "start"]