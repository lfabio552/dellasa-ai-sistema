// backend/src/App.js
const express = require('express');
const router = express.Router();

// Rota de saúde para testar
router.get('/health', (req, res) => {
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'dellasa-acai-backend'
    });
});

module.exports = router;
