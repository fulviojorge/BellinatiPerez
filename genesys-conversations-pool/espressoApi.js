'use strict'
const axios = require('axios');
const moment = require('moment');
const apiConfig = require('./config.json').espresso;

const espressoApi = {

    authData: null,

    getBasicConfig: async function () {
        try {
            if (this.authData == null || this.authData.exipires < moment()) {
                let tokenResponse = await this.getAccessToken();
                //console.log("tokenResponse", tokenResponse.data);
                this.authData = {
                    token: tokenResponse.data.token,
                    expires: moment().add(tokenResponse.data.expires_in, 'seconds'),
                };
            }

            return {
                headers: {
                    'Authorization': 'Bearer ' + this.authData.token,
                    'Content-Type': 'application/json',
                },
            };

        }
        catch (e) {
            console.log("Error", e.response);
            this.requestError(e);
        }
    },

    getAccessToken: function () {
        let clientId = apiConfig.auth.clientId;
        let clientSecret = apiConfig.auth.clientSecret;
        let postData = { 'client_id': clientId, 'client_secret': clientSecret };
        return axios.post(apiConfig.auth.url, postData, { headers: { 'Content-Type': 'application/json' } });
    },

    sendvid: async function (conversationId) {

        let postData = { data: conversationId };
        let url = `${apiConfig.urlBase}/sendvid/`;
        let postConfig = await this.getBasicConfig();

        //return axios.post(url, postData, postConfig);
        return new Promise((resolve, reject) => {
            (getRandomInt(0, 100) % 2 == 0) ? reject("Random") : resolve("Lucky");
        });
    },

    checkvid: async function (conversationId) {

        let postData = { data: conversationId };
        let url = `${apiConfig.urlBase}/checkvid/`;
        let postConfig = await this.getBasicConfig();
        return axios.post(url, postData, postConfig);
    },

    requestError: function (response) {
        console.log("Error on espresso API Call");
    },
};

module.exports = { espressoApi }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/*

curl--location--request POST 'https: //qualicorp.espressolw.com/api/auth/authenticate' \
--header 'Content-Type: application/json' \
--data - raw '{
"client_id": "336a557298040121882450ebd4804091d3f7da99",
    "client_secret": "r17oj4lPQZawqualicorpwDdVbZvSHw8040mOzXj1LQXh"
}'

curl--location--request POST 'https: //qualicorp.espressolw.com/api/espresso/sendvid' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxM2U2ZDNhZGRlNWJhN2I3YWI1ZGQzNyIsImlhdCI6MTYzMTkwMjc0OCwiZXhwIjoxNjMxOTg5MTQ4fQ.k1n1KaSExmTTH8j6NPW0isgUoeAam6CBkWcwDB83rBc' \
--header 'Content-Type: application/json' \
--data - raw '{
"data": "1c3aa676-eb13-472f-a95b-8dc99100d6c1"
}'

curl--location--request POST 'https://qualicorp.espressolw.com/api/espresso/checkvid' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxM2U2ZDNhZGRlNWJhN2I3YWI1ZGQzNyIsImlhdCI6MTYzMTkwMjc0OCwiZXhwIjoxNjMxOTg5MTQ4fQ.k1n1KaSExmTTH8j6NPW0isgUoeAam6CBkWcwDB83rBc' \
--header 'Content-Type: application/json' \
--data - raw '{
"data": "1c3aa676-eb13-472f-a95b-8dc99100d6c1"
}'

*/