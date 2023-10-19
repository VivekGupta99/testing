module.exports = (sequelize, Sequelize) => {
    const expenses = sequelize.define('expense', {

        amount: {
            type: Sequelize.INTEGER
        },
        description: {
            type: Sequelize.STRING,
            // primaryKey:true
        },
        category: {
            type: Sequelize.STRING,

        },
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }

    });
    return expenses
}