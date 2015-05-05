var config = require("./config.json");
var PushBullet = require("pushbullet");
var CronJob = require("cron").CronJob;
var pusher = new PushBullet(config.PUSHBULLET_ACCESS_TOKEN);

var LUNCH = "0 0 11 * * *";
var SUPPER = "0 0 17 * * *";
var TIMEZONE = "Europe/Athens";

new CronJob(LUNCH, function() {
    pusher.note("", "Lunch time", "", function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(res);
    });
}, null, true, TIMEZONE);

new CronJob(SUPPER, function() {
    pusher.note("", "Supper time", "", function(err, res) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(res);
    });
}, null, true, TIMEZONE);
