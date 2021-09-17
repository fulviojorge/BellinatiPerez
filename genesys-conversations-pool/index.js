const { genesysApi } = require("./genesysApi");
const { espressoApi } = require("./espressoApi");

let conversations = [];

genesysApi.createJob("2021-09-16", "2021-09-17")
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

        verifyExistingConversations(conversations);
    })
    .catch((e) => { console.log("Main error", e) });


function verifyConversations(cursor, data) {

    if (cursor == null) {
        cursor = "First call";
    }
    console.log(`${cursor}: ${data.conversations.length}`);

    let output = [];
    data.conversations.forEach((c) => {
        output.push(c.conversationId);
    });
    return output;
}

function verifyExistingConversations(conversations) {
    console.log("\n--- Verifying all conversations\n");

    let outputData = {
        alreadyInBase: [],
        succefulSent: [],
        failedOnCheck: [],
        failedOnSend: [],
    };

    let concurrentTasksCount = 0;
    let taskList = [];

    conversations.forEach(async id => {

        while (concurrentTasksCount++ > 10)    // Limit Takss
            await sleep(500);

        taskList.push(checkAndInsertCnversations(id, outputData).finally(concurrentTasksCount--));
    });

    Promise.all(taskList).then(() => {

        console.log("outputdata:", outputData);
        console.log("Fin");
    });
}

function checkAndInsertCnversations(id, outputData) {
    return new Promise((resolve, reject) => {

        espressoApi.checkvid(id)
            .then((checkResponse) => {
                if (checkResponse.data.result) {
                    outputData.alreadyInBase.push(id);
                }
                else {
                    espressoApi.sendvid(id)
                        .then((sendResponse) => {
                            outputData.succefulSent.push(id);
                            resolve();
                        })
                        .catch((err) => {
                            outputData.failedOnSend.push(id)
                            console.log("Error on send " + id, err);
                            resolve();
                        });
                }
            })
            .catch((err) => {
                outputData.failedOnCheck.push(id)
                console.log("Error on check " + id, err);
                resolve();
            });
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}