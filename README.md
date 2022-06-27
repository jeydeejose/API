# API CONFIG

1. npm install
2. Create database name : "API"
3. npx sequelize-cli db:migrate
4. TO RUN THE API SERVER : nodemon server.js

# API ENDPOINTS

REGISTER - http://127.0.0.1:3000/api/register 
[params:]

firstName, 
lastName, 
address,
postCode,
contactNumber, 
email,
username,
password

--

LOGIN(POST) - http://127.0.0.1:3000/api/login
[params:]

email or username,
password

--

GET USERS(POST)  - http://127.0.0.1:3000/api/get-users

--


UPDATE USER(POST)  - http://127.0.0.1:3000/api/update-user 
[params:]

firstName, 
lastName, 
address,
postCode,
contactNumber, 
id,

--


DELETE USER(POST)  - http://127.0.0.1:3000/api/delete-user 
[params:]

id

--


MULTIPLE DELETE USER(POST)  - http://127.0.0.1:3000/api/multiple-delete-user 
[params:]

id(array) - example:1,2,3


