module.exports = (sequelize, Sequelize) => {
   
		const fileurl =sequelize.define('fileurl', {
			fileURL:Sequelize.STRING,
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			  },
		});
    return fileurl;
}
