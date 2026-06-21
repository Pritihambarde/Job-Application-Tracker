const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const { jobRules, jobUpdateRules, handleValidation } = require('../middleware/validators');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET all jobs for logged-in user, with optional search/filter/sort
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, sort } = req.query;

    const query = { user: req.user.id };

    if (status && ['Applied', 'Interviewing', 'Offer', 'Rejected'].includes(status)) {
      query.status = status;
    }

    if (search) {
      const safe = search.trim().slice(0, 200);
      const regex = new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ company: regex }, { role: regex }];
    }

    let sortSpec = { createdAt: -1 };
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    if (sort === 'company') sortSpec = { company: 1 };
    if (sort === 'updated') sortSpec = { lastStatusChangeAt: -1 };

    const jobs = await Job.find(query).sort(sortSpec);
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET stats summary for the logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id });

    const total = jobs.length;
    const byStatus = { Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
    for (const job of jobs) {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    }

    const responded = byStatus.Interviewing + byStatus.Offer + byStatus.Rejected;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((byStatus.Offer / total) * 100) : 0;

    const daysBetween = (a, b) => Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
    const respondedJobs = jobs.filter((j) => j.status !== 'Applied');
    const avgDaysToResponse = respondedJobs.length
      ? Math.round(
          respondedJobs.reduce((sum, j) => sum + daysBetween(new Date(j.appliedDate || j.createdAt), new Date(j.lastStatusChangeAt)), 0) /
            respondedJobs.length
        )
      : null;

    const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const staleCount = jobs.filter(
      (j) => j.status === 'Applied' && new Date(j.lastStatusChangeAt).getTime() < staleThreshold
    ).length;

    res.json({
      total,
      byStatus,
      responseRate,
      offerRate,
      avgDaysToResponse,
      staleCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// EXPORT as CSV
router.get('/export', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });

    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const header = ['Company', 'Role', 'Status', 'Applied Date', 'Link', 'Notes'];
    const rows = jobs.map((j) =>
      [
        j.company,
        j.role,
        j.status,
        j.appliedDate ? new Date(j.appliedDate).toISOString().slice(0, 10) : '',
        j.link || '',
        j.notes || '',
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pipeline-applications.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET single job
router.get('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE job
router.post('/', auth, jobRules, handleValidation, async (req, res) => {
  try {
    const { company, role, status, link, notes, appliedDate } = req.body;

    const job = new Job({
      user: req.user.id,
      company,
      role,
      status,
      link,
      notes,
      appliedDate,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE job
router.put('/:id', auth, jobUpdateRules, handleValidation, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }

    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const { company, role, status, link, notes, appliedDate } = req.body;

    if (company !== undefined) job.company = company;
    if (role !== undefined) job.role = role;
    if (status !== undefined) job.status = status;
    if (link !== undefined) job.link = link;
    if (notes !== undefined) job.notes = notes;
    if (appliedDate !== undefined) job.appliedDate = appliedDate;

    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE job
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid job id' });
    }
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
