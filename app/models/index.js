'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

/* -- Initialize Sequelize to connect DB -- */
const sequelize = new Sequelize({
  ...config,
  define: {
    timestamps: false
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


/* -- Define data models -- */

// 1. Key
var Key = sequelize.define('key', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: {
    type: Sequelize.TEXT,
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

// 2. Translation
var Translation = sequelize.define('translation', {
  keyId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Key,
      key: 'id'
    }
  },
  locale: {
    type: Sequelize.STRING(2),
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
    type: Sequelize.TEXT,
    allowNull: false
  }
});

/* -- Modularize -- */

module.exports = {
  sequelize,
  Sequelize,
  models: { Key, Translation }
};
