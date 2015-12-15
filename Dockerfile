FROM node
EXPOSE 8080
RUN mkdir /myapp
WORKDIR /myapp
ADD package.json /myapp/package.json
run npm install
ADD . /myapp
