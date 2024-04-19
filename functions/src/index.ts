import * as admin from 'firebase-admin';




admin.initializeApp();


exports.activityLog = require('./activity-log/activity-log');
exports.debug = require('./debug/debug');
exports.movies = require('./movies/movies');
exports.report = require('./report/report');
exports.users = require('./users/users')
