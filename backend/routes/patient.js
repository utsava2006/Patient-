const express = require('express');
const router = express.Router();

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

module.exports = router;
