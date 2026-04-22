const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addPurchase,
  updatePurchaseStatus,
  getClientStats,
  importClientsFromExcel,
  exportClientsToExcel,
} = require('../controller/clientController');
const jwtAuth = require('../middleware/jwtAuth');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xlsx, .xls)'));
    }
  },
});

const uploadImportFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size must be less than 5MB' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(400).json({ success: false, message: error.message });
  });
};

// PUBLIC route - no authentication required for stats
router.get('/stats', getClientStats);

// Apply authentication to all other routes
router.use(jwtAuth, adminMiddleware);

// Protected routes
router.get('/export', exportClientsToExcel);
router.post('/import', uploadImportFile, importClientsFromExcel);

router.route('/').get(getClients).post(createClient);

// More specific nested routes MUST come before /:id route
router.post('/:id/purchase', addPurchase);
router.put('/:id/purchase/:purchaseIndex', updatePurchaseStatus);

// Generic :id route comes last
router
  .route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
