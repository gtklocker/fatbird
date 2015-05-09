var request = require("request");
var twilio = require("twilio")();
var CronJob = require("cron").CronJob;

var MORNING = "0 0 9 * * *";
var LUNCH = "0 0 11 * * *";
var SUPPER = "0 0 17 * * *";
var TIMEZONE = "Europe/Athens";

var schedule;

function getMeal(time) {
    var dateString = (new Date()).toISOString().replace(/T.+/, "");
    var realDay;

    if (schedule["shmera"]["day"] == dateString) {
        realDay = "shmera";
    }
    else if (schedule["ayrio"]["day"] == dateString) {
        realDay = "ayrio";
    }
    else {
        // API is seriously outdated!
        return null;
    }

    return schedule[realDay][time]["kyriosPiata"];
}

var recipients = process.env.RECIPIENTS.split(",");

function smsFactory(intro, time) {
    return function() {
        if (!getMeal(time)) {
            console.log("no food schedule for today, can't send sms");
            return;
        }
        recipients.forEach(function(recipient) {
            console.log("sending sms for", time, "to", recipient);
            twilio.messages.create({
                from: process.env.TWILIO_FROM,
                to: recipient,
                body: intro + " " + getMeal(time) + "."
            }, function(err, message) {
                if (err) {
                    console.log("there was an error in sending the sms to", recipient);
                    console.log(err);
                    return;
                }
                lastMessage = message.dateCreated;
                console.log("message to", recipient, "sent on", message.dateCreated);
            });
        });
    };
}

function requestSchedule() {
    request({
        url: process.env.SITISI_API_URL,
        json: true
    }, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            schedule = body;

            // Workaround for a bug where the API jumps between two dates.
            // TODO: This should go away.
            if (!getMeal("bradi")) {
                requestSchedule();
                return;
            }
            console.log("fetched schedule from", process.env.SITISI_API_URL);
        }
    });
}

requestSchedule();
new CronJob(MORNING, requestSchedule, null, true, TIMEZONE);
new CronJob(LUNCH, smsFactory("Καλημέρα! Σήμερα η λέσχη θα έχει", "mesimeri"), null, true, TIMEZONE);
new CronJob(SUPPER, smsFactory("Καλό σου απόγευμα! H λέσχη τώρα θα έχει", "bradi"), null, true, TIMEZONE);
