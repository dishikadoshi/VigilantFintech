const express = require('express');
const router  = express.Router();

router.get('/', (_req, res) => {
  res.json({
    success  : true,
    service  : 'Vigilant Fintech Backend',
    status   : 'healthy',
    storage  : process.env.STORAGE_PROVIDER || 'google_sheets',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
