const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Delete a document
router.delete('/document/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await req.prisma.document.findUnique({
      where: { id: parseInt(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Attempt to delete file from disk
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await req.prisma.document.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Identify pill using Gemini AI
router.post('/identify-pill', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // The Gemini API requires base64 encoded data
    const imagePart = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType
      },
    };

    // Use Gemini 1.5 Flash for vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Identify the medication, pill, or tablet in this image. Explain its typical purpose, common dosage, and provide general medical advice. Format the response nicely using markdown and keep it professional and easy to understand for a patient.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean up the temporary uploaded file to save disk space
    fs.unlinkSync(filePath);

    res.json({ analysis: responseText });
  } catch (error) {
    console.error("Gemini AI Error:", error);
    
    // Clean up file in case of error too
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to analyze image using AI' });
  }
});

module.exports = router;
