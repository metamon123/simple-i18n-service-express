var express = require('express');
var { Sequelize, Key, Translation } = require('../models')

var router = express.Router();

class ResultWrapper {
  constructor(status_code, data) {
    this.status_code = status_code;
    this.data = data;

    // naive classification of status code
    if (status_code >= 400)
      this.success = false;
    else
      this.success = true;
  }
};

var ResultHandler = (res) => function(result) {
  if (result instanceof Sequelize.BaseError)
    res.status(400).json({ success: false, data: result.toString() });
  else if (result instanceof ResultWrapper)
    res.status(result.status_code).json({ success: result.success, data: result.data });
  else 
    console.error(result);
};

/* Retrieve keys */
router.get('/', (req, res) => {
  var name = req.query.name;

  // Check query param <name> (optional)
  var filter = (name === undefined) ? {} : { name: name };

  Key.findAll({ where: filter })
    .then((keys) => {
      res.json({ success: true, data: { keys: keys } });
    })
    .catch(ResultHandler(res));
});

/* Add key */
router.post('/', (req, res) => {
  var name = req.body.name; // what happens if name is Object?

  // Check whether name is given
  if (name === undefined) {
    res.status(400).json({ success: false, data: "Key name should be given" });
    return;
  }

  Key.findOrCreate({ where: { name: name } })
    .then(([key, created]) => {
      if (!created)
        res.status(400).json({ data: "Duplicated key name" });
      else
        res.json({ data: { key: key } });
    })
    .catch(ResultHandler(res));
});

/* Modify key */
router.put('/:id', (req, res) => {
  var id = req.params.id;

  // Check whether id is given and valid
  if (id === undefined) {
    res.status(400).json({ success: false, data: "Key id should be given" });
    return;
  }
  id = isNaN(parseInt(id)) ? -1 : parseInt(id);
  if (id === -1) {
    res.status(400).json({ success: false, data: "Key id should be decimal number" });
    return;
  }

  // Check whether name is given
  var name = req.body.name;
  if (name === undefined) {
    res.status(400).json({ success: false, data: "Key name should be given"});
    return;
  }

  Key.update({ name: name }, { where: { id: id } })
    .then(([cnt]) => {
      if (cnt < 1) {
        res.status(404).json({ success: false, data: "No such key id"});
      } else {
        // Sequelize reference:
        //     "affected rows can be retrieved within one query
        //     ONLY IN postgres with options.returning true"
        res.json({
          success: true,
          data: { key: { id: id, name: name } }
        })
      }
    })
    .catch(ResultHandler(res));
});

/* Get all translations of the key */
router.get("/:keyId/translations", (req, res) => {
  // Check whether keyId is given and valid
  var keyId = req.params.keyId;
  if (keyId === undefined) {
    res.status(400).json({ success: false, data: "Key id should be given" });
    return;
  }
  keyId = isNaN(parseInt(keyId)) ? -1 : parseInt(keyId);
  if (keyId === -1) {
    res.status(400).json({ success: false, data: "Key id should be decimal number" });
    return;
  }
  
  Key.findOne({ where: { id: keyId } })
    .then((key) => {
      if (key == null) {
        throw new ResultWrapper(404, "No such key id");
      }
    })
    .then(() => {
      return Translation.findAll({ where: { keyId: keyId } });
    })
    .then((translations) => {
      res.json({ success: true, data: { translations: translations }});
    })
    .catch(ResultHandler(res));
});

/* Get <locale> translation of the key */
router.get("/:keyId/translations/:locale", (req, res) => {
  // Check whether keyId is given and valid
  var keyId = req.params.keyId;
  if (keyId === undefined) {
    res.status(400).json({ success: false, data: "Key id should be given" });
    return;
  }
  keyId = isNaN(parseInt(keyId)) ? -1 : parseInt(keyId);
  if (keyId === -1) {
    res.status(400).json({ success: false, data: "Key id should be decimal number" });
    return;
  }

  // Check whether translation locale is given
  var locale = req.params.locale;
  if (locale === undefined) {
    res.status(400).json({ success: false, data: "Locale should be given" });
    return;
  }

  Key.findOne({ where: { id: keyId } })
    .then((key) => {
      if (key == null) {
        throw new ResultWrapper(404, "No such key id");
      }
    })
    .then(() => {
      return Translation.findOne({ where: { keyId: keyId, locale: locale } });
    })
    .then((translation) => {
      if (translation != null)
        res.json({ success: true, data: { translation: translation }});
      else
        res.status(404).json({ success: false, data: `Translation has not provided for (keyId,locale)=(${keyId},${locale})` });
    })
    .catch(ResultHandler(res));
});

/* Add <locale> translation of the key */
router.post("/:keyId/translations/:locale", (req, res) => {
  // Check whether keyId is given and valid
  var keyId = req.params.keyId;
  if (keyId === undefined) {
    res.status(400).json({ success: false, data: "Key id should be given" });
    return;
  }
  keyId = isNaN(parseInt(keyId)) ? -1 : parseInt(keyId);
  if (keyId === -1) {
    res.status(400).json({ success: false, data: "Key id should be decimal number" });
    return;
  }

  // Check whether translation locale is given
  var locale = req.params.locale;
  if (locale === undefined) {
    res.status(400).json({ success: false, data: "Locale should be given" });
    return;
  }
  
  // Check whether translation value is given
  var value = req.body.value;
  if (value === undefined) {
    res.status(400).json({ success: false, data: "Value should be given" });
    return;
  }

  Translation.create({
    keyId: keyId,
    locale: locale,
    value: value
  })
    .then((new_translation) => {
      res.json({ success: true, data: { translation: new_translation } });
    })
    .catch(ResultHandler(res));
});

/* Update <locale> translation of the key */
router.put("/:keyId/translations/:locale", (req, res) => {
  // Check whether keyId is given and valid
  var keyId = req.params.keyId;
  if (keyId === undefined) {
    res.status(400).json({ success: false, data: "Key id should be given" });
    return;
  }
  keyId = isNaN(parseInt(keyId)) ? -1 : parseInt(keyId);
  if (keyId === -1) {
    res.status(400).json({ success: false, data: "Key id should be decimal number" });
    return;
  }

  // Check whether translation locale is given
  var locale = req.params.locale;
  if (locale === undefined) {
    res.status(400).json({ success: false, data: "Locale should be given" });
    return;
  }
  
  // Check whether translation value is given
  var value = req.body.value;
  if (value === undefined) {
    res.status(400).json({ success: false, data: "Value should be given" });
    return;
  }
  
  // Manually retrieve translation since options.returning during update is not supported in SQLite3
  Translation.findOne({ where: { keyId: keyId, locale: locale } })
    .then((translation) => {
      if (translation == null) {
        throw new ResultWrapper(400, "No such translation");
      }
      return Translation.update(
        { value: value }, 
        { where: { keyId: keyId, locale: locale }}
      );
    })
    .then(() => {
      res.json({
        success: true,
        data: { 
          translation: { 
            id: translation.id, 
            keyId: keyId, 
            locale: locale, 
            value: value 
          }
        }
      });
    })
    .catch(ResultHandler(res));
})

module.exports = router;
