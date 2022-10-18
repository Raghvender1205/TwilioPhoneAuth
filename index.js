const dotenv = require('dotenv').config();
const express = require('express');

const app = express();
const port = 3000;
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

/**
 * Root route
 */
app.get('/', (req, res) => {
    res.status(200).send({
        message: "HomePage",
        info: {
            login: "Send Verification code through /login. It contains phoneNumber and Channel (SMS/Call)",
            verify: "Verify the recieved code through /verify. It contains phoneNumber and code"
        }
    })
});

/**
 * Login Endpoint
 */
app.get('/login', (req, res) => {
    if (req.query.phoneNumber) {
        client
            .verify
            .services(process.env.SERVICE_ID)
            .verifications
            .create({
                to: `+${req.query.phoneNumber}`,
                channel: req.query.channel === 'call' ? 'call' : 'sms'
            })
            .then(data => {
                res.status(200).send({
                    message: "OTP Sent",
                    phoneNumber: req.query.phoneNumber,
                    data
                })
            })
    } else {
        res.status(400).send({
            message: "Wrong phoneNumber",
            phoneNumber: req.query.phoneNumber,
            data
        })
    }
});

/**
 * Verify Endpoint
 */
app.get('/verify', (req, res) => {
    if (req.query.phoneNumber && (req.query.code).length === 4) {
        client
            .verify
            .services(process.env.SERVICE_ID)
            .verificationChecks
            .create({
                to: `+${req.query.phoneNumber}`,
                code: req.query.code
            })
            .then(data => {
                if (data.status === 'approved') {
                    res.status(200).send({
                        message: "User is Verified",
                        data
                    })
                }
            })
    } else {
        res.status(400).send({
            message: "Wrong phone Number or OTP",
            phoneNumber: req.query.phoneNumber,
            data
        })
    }
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})