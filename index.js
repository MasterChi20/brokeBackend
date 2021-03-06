const express = require('express');
const app = express();
const port = 8000;
const envvar = require('envvar');
const moment = require('moment');
const plaid = require('plaid');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PLAID_CLIENT_ID = '5bbf84f634d5c50012866d5d';
const PLAID_SECRET = 'Nice Try';
const PLAID_PUBLIC_KEY = '65fec6f4ef6d14b46623f6daf1ce3a';
const PLAID_ENV = envvar.string('PLAID_ENV', 'development');
// We store the access_token in memory - in production, store it in a secure
// persistent data store

// Initialize the Plaid client
const plaidClient = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV]
);






app.get('/', (req, res) => {
    console.log("I was hit!");
    res.send(null);
});

app.post('/transactions' , (req, res) => {
    console.log("I entered transactions");
    var b = req;
	publicToken = b.body.public_key;
    async function Wrapper() {
    	await plaidClient.exchangePublicToken(
            publicToken,
            async (error, tokenResponse) => {
                if (error !== null) {
                    var msg = 'Could not exchange public_token!';
                    console.log(msg + '\n' + error);
                }
                ACCESS_TOKEN = tokenResponse.access_token;
                ITEM_ID = tokenResponse.item_id;

                /*-------------get ACOUNTS & TRANSACTIONS details from the last 2 months-----------*/
                let startDate = moment()
                    .subtract(60, 'days')
                    .format('YYYY-MM-DD');
                let endDate = moment().format('YYYY-MM-DD');

                await plaidClient.getTransactions(
                    ACCESS_TOKEN,
                    startDate,
                    endDate,
                    async (err, transactionRes) => {
                        if (err !== null) {
                            if (plaid.isPlaidError(err)) {
                                // This is a Plaid error
                                console.log(err.error_code + ': ' + err.error_message);
                            } else {
                                // This is a connection error, an Error object
                                console.log(err.toString());
                            }
                        }
                        res.send(transactionRes);
                        console.log("Sent the transactions.");
                    }
                );
            }
        );
    }
    Wrapper();
});

app.listen(port, () => console.log(`Broke is listening on port ${port}!`));
