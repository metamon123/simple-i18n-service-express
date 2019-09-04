var express = require('express');
var { Sequelize, sequelize, Key, Translation } = require('../models')

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
  if (result instanceof Sequelize.ValidationError)
    res.status(400).json({ success: false, data: result.toString() });
  else if (result instanceof ResultWrapper)
    res.status(result.status_code).json({ success: result.success, data: result.data });
  else
    console.error(result); // 이거는 status(500) 으로...? 아니면 자동으로 되나...?
};

function allocateKeyId() {
  /* Get smallest non-allocated id
   * Currently implemented within 1 query, but not efficient yet.
   * Also, locking is needed here. */
  return sequelize.query(
    "select distinct `id` + 1 from `keys` where `id` + 1 not in (select distinct `id` from `keys`);",
    { type: sequelize.QueryTypes.SELECT }
  )
    .then((ids) => {
      if (ids.length == 0)
        return 1;
      else
        return Object.values(ids[0])[0]; // smallest id, guaranteed by ordering of Key model.
    })
    .catch(console.error);
}

// Retrieve keys
router.get('/keys', (req, res) => {
  var name = req.query.name;

  // Check query param <name> (optional)
  var filter = (name === undefined) ? {} : { name: name };
  console.log(name);

  Key.findAll({ where: filter })
    .then((keys) => {
      console.log(keys);
      res.json({ success: true, data: { keys: keys } });
    })
    .catch(ResultHandler(res));
});

// Add key
router.post('/keys', (req, res) => {
  var name = req.body.name; // what happens if name is Object?

  // Check whether name is given
  if (name === undefined) {
    res.status(400).json({ success: false, data: "Key name should be given" });
    return;
  }

  // TODO: (if needed) Check whether name is valid
  // Temporarily assume that we allow name="" or name={}

  console.log(name);

  // In SQLite3, findOrCreate uses two queries (select => insert)
  // Using select and insert separately is better since allocateKeyId is called less frequently.
  Key.findOne({ where: { name: name } })
    .then((key) => {
      if (key != null)
        throw new ResultWrapper(400, "Duplicated key name");
        // res.status(400).json({ success: false, data: "Duplicated key name"});
      return allocateKeyId();
    })
    .then((allocated_id) => {
      return Key.create({ id: allocated_id, name: name });
    })
    .then((new_key) => {
      console.log(new_key);
      res.json({ success: true, data: { key: new_key } })
    })
    .catch(ResultHandler(res));
/*
  Key
    .findOrCreate({ where: { name: name } })
    .then(([key, created]) => {
      if (!created)
        res.status(400).json({ data: "Duplicated key name" });
      else
        res.json({ data: { key: key } });
    })
    .catch(errorHandler);
*/

});

// Create / Modify key
router.put('/keys/:id', (req, res) => {
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

  Key.findOne({ where: { id: id } })
    .then((key) => {
      if (key == null) {
        // insert given key
        return Key.create({ id: id, name: name })
          .then((new_key) => {
            console.log(new_key);
            throw new ResultWrapper(200, { key: new_key });
          });
      }
      
      // update found key
      return Key.update(
          { name: name }, 
          { where: { id: id } }
        );
    })
    .then(([cnt]) => {
      // result of update
      if (cnt != 1) {
        // Race condition (other user may delete the key if delete operation exists)
        // TODO: Prevent race condition. 
        throw new ResultWrapper(500, "Rare error in PUT /keys/:id");
      } else {
        res.json({
          success: true, 
          data: { key: { id: id, name: name } }
        });
      }
    })
    .catch(ResultHandler(res));
  
  /* In SQLite3, upsert uses two queries (insert => update) & update is always executed
   * Sequelize determines "existence" of item using primary key OR unique key automatically,
   * which means both id and name can be used. Therefore using upsert is not good in this case. */
  // Key
  //   .upsert({ id: id, name: name }, { where: { id: id } })
  //   .then(() => {
  //     // Sequelize Reference:
  //     //   1. affected rows can be retrieved within one query ONLY IN postgres with options.returning true
  //     //   2. In SQLite3, there is no way to know whether the row already existed or not
  //     res.json({ success: true, data: { id: id, name: name } });
  //   })
  //   .catch(ResultHandler(res));
});

module.exports = router;
