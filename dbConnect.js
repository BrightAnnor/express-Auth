const {Sequelize} = require('sequelize');

const DBNAME = process.env.DATABASE_NAME
const DBUSER= process.env.DB_USER
const DBPASS = process.env.DB_PASS

console.log(DBPASS);

const sequelize = new Sequelize(DBNAME,DBUSER,DBPASS,{
    host:'localhost',
    dialect:'mysql'
})

module.exports = sequelize