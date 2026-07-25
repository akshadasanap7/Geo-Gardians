const router  = require('express').Router();
const Tourist = require('../models/Tourist');
const crypto  = require('crypto');

// POST /api/verify — verify tourist digital identity
router.post('/', async (req, res, next) => {
  try {
    const { qrCode, digitalId, touristId } = req.body;
    const tourist = await Tourist.findOne({
      $or: [
        ...(qrCode    ? [{ qrCode }]    : []),
        ...(digitalId ? [{ digitalId }] : []),
        ...(touristId ? [{ touristId }] : [])
      ]
    });

    if (!tourist) return res.status(404).json({ verified: false, message: 'Identity not found' });

    res.json({
      verified:      true,
      touristId:     tourist.touristId,
      name:          tourist.name,
      destination:   tourist.destination,
      status:        tourist.status,
      riskLevel:     tourist.latestRiskLevel,
      zoneInfo:      tourist.zoneInfo,
      blockchainHash: tourist.digitalId,
      verifiedAt:    new Date().toISOString(),
      note:          'Sensitive personal data is stored off-chain and not exposed through this endpoint.'
    });
  } catch (err) { next(err); }
});

module.exports = router;
