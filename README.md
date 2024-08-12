# Asset Trading Tracker

## requirement for run the project
1. for run this project you need to create .env file.
2. inside the env you need to give the value for below mentioned variable.
* mongoURL= Here ypou need to give mongodb database url
* SECRET_KEY=here you have to give some random character or number.
* CLOUD_NAME= Here you have give aloudinary API name.
* API_SECRET= Here you have give cloudinary API secret here.
* API_KEY= Here you have to give cloudinary API key.


## Installation
Install My Projects Using npm
```bash
    git clone https://github.com/amit-vis/assets_tracker
    npm install
    cd assets_tracker
```

## Running Test
To run tests, run the following command
```bash
    npm start
```


## Endpoints and Actions:
* /user/signup[post]: Create a new user account.
* /user/login[post]: Login for existing user.

* /requests/:id/negotiate[put]: update the proposole price.
* /requests/:id/accept[put]: accept proposal request.
* /requests/:id/deny[put]: deny the proposal request.

* /users/:id/assests[get]: get the assets details.
* /marketplace/assets[get]: get the list of market place assets.
* /users/:id/requests[get]: get the lists of proposal requests.

* /assets[post]: create the assets.
* /assets/:id[put]: update the assets.
* /assets/:id/publish[put]: publish the assets on market place
* /assets/:id[get]: get the assets details.
* /assets/getAssets[get]: get the assets list for logged in user.
* /assets/:id/request[post]: create proposal requests.

## Folder Structure
* config
    - db.js
    - cloudinary.js
    - passport-jwt.js
    
* controllers
    - asset_controller.js
    - request_controller.js
    - user_controller.js
* middleware
    - token.js
* model
    - assest.js
    - request.js
    - user.js
* routes
    - assets.js
    - request.js
    - index.js
    - user.js
* test
    - asset_controller.test.js
    - request_controller.test.js
    - user_controller.test.js
- index.js
- package-lock.json
- package.json