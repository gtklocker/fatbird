var request = require("request");
var PushBullet = require("pushbullet");
var CronJob = require("cron").CronJob;
var pusher = new PushBullet(process.env.PUSHBULLET_ACCESS_TOKEN);

var LUNCH = "0 0 11 * * *";
var SUPPER = "0 0 17 * * *";
var TIMEZONE = "Europe/Athens";

var schedule;

function noteFactory(title, attr) {
    return function() {
        pusher.note("", title, schedule["shmera"][attr]["kyriosPiata"], function(err, res) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(res);
        });
    };
}

request({
    url: process.env.SITISI_API_URL,
    json: true
}, function(err, res, body) {
    if (!err && res.statusCode == 200) {
        schedule = body;
    }
});

new CronJob(LUNCH, noteFactory("Lunch time", "mesimeri"), null, true, TIMEZONE);
new CronJob(SUPPER, noteFactory("Supper time", "bradi"), null, true, TIMEZONE);
