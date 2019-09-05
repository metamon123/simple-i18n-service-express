FROM node:12

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY app/package.json .
COPY app/yarn.lock .
RUN yarn

COPY app ./

EXPOSE 3000
CMD ["yarn", "start"]

