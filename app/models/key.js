module.exports = (sequelize, DataTypes) => {
  var Key = sequelize.define('key', {
    id: {
      type: DataTypes.INTEGER,
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
  
  // Specify default order for key id allocator. 
  // https://github.com/sequelize/sequelize/issues/9289
  Key.addScope('defaultScope', {
    order: [['id', 'ASC']],
  }, { override: true });

  return Key;
}