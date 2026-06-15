const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Doctor prescribes tablet
router.post('/prescribe', async (req, res) => {
  const { patientId, doctorId, tabletName, dosage, timing } = req.body;

  if (!patientId || !doctorId || !tabletName || !dosage || !timing) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const prescription = await req.prisma.prescription.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        tabletName,
        dosage,
        timing
      }
    });

    await req.prisma.visit.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId)
      }
    });

    await req.prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: {
        visitCount: {
          increment: 1
        }
      }
    });

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor sets next visit date
router.put('/patient/:patientCode/visit', async (req, res) => {
  const { patientCode } = req.params;
  const { nextVisitDate } = req.body;

  if (!nextVisitDate) {
    return res.status(400).json({ error: 'Next visit date is required' });
  }

  try {
    const patient = await req.prisma.patient.update({
      where: { patientCode },
      data: {
        nextVisitDate: new Date(nextVisitDate)
      }
    });

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor deletes a visit record
router.delete('/visit/:visitId', async (req, res) => {
  const { visitId } = req.params;

  try {
    const visit = await req.prisma.visit.findUnique({ where: { id: parseInt(visitId) } });
    if (visit) {
      await req.prisma.patient.update({
        where: { id: visit.patientId },
        data: { visitCount: { decrement: 1 } }
      });
    }

    await req.prisma.visit.delete({
      where: { id: parseInt(visitId) }
    });
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Explicitly log a new visit
router.post('/log-visit', async (req, res) => {
  const { patientId, doctorId } = req.body;
  if (!patientId || !doctorId) return res.status(400).json({ error: 'Missing fields' });

  try {
    const visit = await req.prisma.visit.create({
      data: { patientId: parseInt(patientId), doctorId: parseInt(doctorId) }
    });
    await req.prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: { visitCount: { increment: 1 } }
    });
    res.json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Doctor deletes a prescription
router.delete('/prescription/:prescriptionId', async (req, res) => {
  const { prescriptionId } = req.params;

  try {
    await req.prisma.prescription.delete({
      where: { id: parseInt(prescriptionId) }
    });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor gets stats
router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await req.prisma.patient.count();
    res.json({ totalPatients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor gets all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await req.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor updates credentials
router.put('/:id/credentials', async (req, res) => {
  const { id } = req.params;
  const { newUsername, currentPassword, newPassword } = req.body;

  try {
    const doctor = await req.prisma.doctor.findUnique({ where: { id: parseInt(id) } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const dataToUpdate = {};
    if (newUsername && newUsername !== doctor.username) {
      const existing = await req.prisma.doctor.findUnique({ where: { username: newUsername } });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      dataToUpdate.username = newUsername;
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const updatedDoctor = await req.prisma.doctor.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json({ message: 'Credentials updated successfully', username: updatedDoctor.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor deletes a patient
router.delete('/patient/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patientId = parseInt(id);

    // Delete related records first
    await req.prisma.vitals.deleteMany({ where: { patientId } });
    await req.prisma.prescription.deleteMany({ where: { patientId } });
    await req.prisma.visit.deleteMany({ where: { patientId } });

    // Then delete patient
    await req.prisma.patient.delete({ where: { id: patientId } });

    res.json({ message: 'Patient and all related records deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
