module.exports = (sequelize, DataTypes) => {
  var Translation = sequelize.define('translation', {
    locale: {
      type: DataTypes.STRING(2),
      allowNull: false,
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
  
  Translation.associate = (models) => {
    Translation.belongsTo(models.Key, {
      foreignKey: "keyId"
    });
  };

  return Translation;
}