require('dotenv').config();

let usersServiceURL = process.env.USERS_SERVICE_URL;
module.exports = usersServiceURL;