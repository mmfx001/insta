const { Sequelize } = require('sequelize');

// MySQL bilan bog‘lanish
const sequelize = new Sequelize('database_name', 'username', 'password', {
    host: 'localhost', // yoki boshqa host
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('MySQL bilan muvaffaqiyatli bog‘landi'))
    .catch(err => console.error("Bog'lanishda xato:", err));

module.exports = sequelize;
