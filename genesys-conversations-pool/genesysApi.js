'use strict'
const axios = require('axios');
const moment = require('moment');
const apiConfig = require('./config.json').genesys;


const genesysApi = {

    authData: null,

    getBasicConfig: async function () {
        try {
            if (this.authData == null || this.authData.exipires < moment()) {
                let tokenResponse = await this.getAccessToken();
                // console.log("tokenResponse", tokenResponse.data);
                this.authData = {
                    token: tokenResponse.data.access_token,
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
            console.log("Error", e);
            this.requestError(e);
        }
    },

    getAccessToken: function () {
        let clientId = apiConfig.auth.clientId;
        let clientSecret = apiConfig.auth.clientSecret;
        let encodedData = Buffer.from(clientId + ':' + clientSecret).toString('base64');

        let config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + encodedData
            },
        };
        return axios.post(apiConfig.auth.url, apiConfig.auth.content, config);
    },

    createJob: async function (startOfPeriod, endOfPeriod) {

        let postData = {
            interval: `${moment(startOfPeriod).toISOString()}/${moment(endOfPeriod).toISOString()}`
        };

        let url = `${apiConfig.urlBase}/analytics/conversations/details/jobs`;
        return axios.post(url, postData, await this.getBasicConfig());
    },

    verifyJob: async function (jobId) {
        let url = `${apiConfig.urlBase}/analytics/conversations/details/jobs/${jobId}`;
        return axios.get(url, await this.getBasicConfig());
    },

    getResults: async function (jobId, pageSize, cursor) {
        let url = `${apiConfig.urlBase}/analytics/conversations/details/jobs/${jobId}/results?pageSize=${pageSize}`;
        if (cursor != null && cursor != "") {
            url += "&cursor=" + cursor;
        }
        return axios.get(url, await this.getBasicConfig());
    },

    requestError: function (response) {
        console.log("Error on genesys API Call");
    },
};

module.exports = { genesysApi }
