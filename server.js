var request = require("request");
var PushBullet = require("pushbullet");
var CronJob = require("cron").CronJob;
var pusher = new PushBullet(process.env.PUSHBULLET_ACCESS_TOKEN);

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

    if (!realDay) {
        // API is seriously outdated!
        return undefined;
    }

    return schedule[realDay][time]["kyriosPiata"];
}

function noteFactory(title, time) {
    return function() {
        if (!getMeal(time)) {
            console.log("no food schedule for today, can't push out notification");
            return;
        }
        console.log("pushing notification for", title);
        pusher.note("", title, getMeal(time), function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(res);
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
new CronJob(LUNCH, noteFactory("Lunch time", "mesimeri"), null, true, TIMEZONE);
new CronJob(SUPPER, noteFactory("Supper time", "bradi"), null, true, TIMEZONE);
