# backend/Dockerfile (recommended)
FROM node:18

# install python & build tooling required by node-gyp/node-pre-gyp
RUN apt-get update && \
    apt-get install -y python3 make g++ build-essential && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# avoid copying host node_modules into the image
COPY package*.json ./

# install deps inside the container (native modules will be compiled for linux/x64)
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
