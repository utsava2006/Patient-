const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get patient details and history by patient code
router.get('/:patientCode', async (req, res) => {
  const { patientCode } = req.params;

  try {
    const patient = await req.prisma.patient.findUnique({
      where: { patientCode },
      include: {
        vitals: {
          orderBy: { recordedAt: 'desc' }
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              select: { username: true }
            }
          }
        },
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            doctor: {
              select: { username: true }
            }
          }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patient logs vitals
router.post('/vitals', async (req, res) => {
  const { patientId, systolicBP, diastolicBP, bloodSugar } = req.body;
  
  if (!patientId || !systolicBP || !diastolicBP || !bloodSugar) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const vitals = await req.prisma.vitals.create({
      data: {
        patientId: parseInt(patientId),
        systolicBP: parseInt(systolicBP),
        diastolicBP: parseInt(diastolicBP),
        bloodSugar: parseInt(bloodSugar)
      }
    });

    res.json(vitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Patient uploads a document
router.post('/upload', upload.single('file'), async (req, res) => {
  const { patientId, title } = req.body;
  
  if (!patientId || !title || !req.file) {
    return res.status(400).json({ error: 'Patient ID, title, and file are required' });
  }

  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const document = await req.prisma.document.create({
      data: {
        patientId: parseInt(patientId),
        title,
        fileName: req.file.originalname,
        fileUrl
      }
    });

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
