module.exports = (sequelize, DataTypes) => {
  var Key = sequelize.define('key', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      validate: {
        isValidKeyName(value) {
          if (/[^.a-z]/.exec(value) !== null) {
            throw new Error(`Wrong key name - ${value}`);
          }
        }
      }
    }
  });

  return Key;
}