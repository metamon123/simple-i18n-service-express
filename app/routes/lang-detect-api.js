var express = require('express');
var DetectLanguage = require('detectlanguage');
var detectLanguage = new DetectLanguage({
  key: "ee00b8e4ff91a3ef75518f62de797187", ssl: true
}); 

var router = express.Router();

router.get("/", (req, res) => {
  var message = req.query.message;
  if (message === undefined) {
    res.status(400).json({ success: false, data: "Message to find locale is not given"});
    return;
  }
  
  if (message === "") {
    res.status(400).json({ success: false, data: "Message should not be empty"});
    return;
  }

  detectLanguage.detect(message, (error, results) => {
    if (error)
      console.error(error)
    else {    
      var result = results[0]; // show result with highest confidence
      res.json({ success: true, data: { locale: result.language } });    
    } 
  });
})

module.exports = router;