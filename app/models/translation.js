module.exports = (sequelize, DataTypes) => {
  var Key = require('./key')(sequelize, DataTypes);

  // (keyId, locale) become composite primary key.
  var Translation = sequelize.define('translation', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true
    },
    keyId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
	      model: Key,
	      key: 'id'
	    }
    },
    locale: {
      type: DataTypes.STRING(2),
      primaryKey: true,
      validate: {
        isValidLocale(value) {
          valid_locales = ['ko', 'en', 'ja']
          if (!valid_locales.includes(value)) {
            throw new Error(`Wrong translation locale - ${value}`);
          }
        }
      }
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return Translation;
}