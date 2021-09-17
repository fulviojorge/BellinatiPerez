const { genesysApi } = require("./genesysApi");

let conversations = [];

genesysApi.createJob("2021-03-10", "2021-09-15")
    .then(async (createResponse) => {


        let jobId = createResponse.data.jobId;

        console.log(`Created Job: ${jobId}`);
        let tries = 10;
        do {
            console.log(`Try to get status of job: ${jobId}`);
            let statusResponse = await genesysApi.verifyJob(jobId);

            console.log(`\t Current Status: ${statusResponse.data.state}`);
            if (statusResponse.data.state == "FULFILLED") {
                console.log(`Job ${jobId} is ready to get results`);

                let cursor = null;
                do {
                    let results = await genesysApi.getResults(jobId, 200, cursor);
                    conversations = conversations.concat(verifyConversations(cursor, results.data));
                    cursor = results.data.cursor;
                } while (cursor)
                tries = 0;  // Finish the loop
            }
            else {
                await sleep(1000)
            }
        } while (tries-- > 0);

        console.log("Result:", conversations);
        console.log(`Total: ${conversations.length} conversations processed`);

    })
    .catch((e) => { console.log("MAin error", e) });

function verifyConversations(cursor, data) {

    if (cursor == null) {
        cursor = "First call";
    }
    console.log(`${cursor}: ${data.conversations.length}`);

    let output = [];
    data.conversations.forEach((c) => output.push(c.conversationId))
    return output;
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}