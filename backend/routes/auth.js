const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'super-secret-key-for-now'; // In prod, use environment variable

// Generate a random patient code (PT-XXXX)
const generatePatientCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PT-${num}`;
};

// Patient Registration (New User)
router.post('/patient/register', async (req, res) => {
  const { name, phoneNumber } = req.body;
  if (!name || !phoneNumber) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  try {
    let patient = await req.prisma.patient.findUnique({
      where: { phoneNumber }
    });

    if (patient) {
      return res.status(400).json({ error: 'Phone number already registered. Please use Patient Login.' });
    }

    let patientCode;
    let isUnique = false;
    while (!isUnique) {
      patientCode = generatePatientCode();
      const existing = await req.prisma.patient.findUnique({ where: { patientCode } });
      if (!existing) isUnique = true;
    }

    patient = await req.prisma.patient.create({
      data: {
        name,
        phoneNumber,
        patientCode
      }
    });

    const token = jwt.sign({ id: patient.id, role: 'patient' }, JWT_SECRET);
    res.json({ token, patient });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patient Login (Old User)
router.post('/patient/login', async (req, res) => {
  const { name, phoneNumber } = req.body;
  if (!name || !phoneNumber) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  try {
    const patient = await req.prisma.patient.findUnique({
      where: { phoneNumber }
    });

    if (!patient) {
      return res.status(401).json({ error: 'Phone number not found. Please register first.' });
    }

    const token = jwt.sign({ id: patient.id, role: 'patient' }, JWT_SECRET);
    res.json({ token, patient });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Login
router.post('/doctor/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const doctor = await req.prisma.doctor.findUnique({
      where: { username }
    });

    if (!doctor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: doctor.id, role: 'doctor' }, JWT_SECRET);
    res.json({ token, doctor: { id: doctor.id, username: doctor.username } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
