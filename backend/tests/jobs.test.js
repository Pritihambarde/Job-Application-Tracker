const request = require('supertest');
const app = require('../app');
const Job = require('../models/Job');

const userA = { name: 'User A', email: 'usera@example.com', password: 'PasswordA1' };
const userB = { name: 'User B', email: 'userb@example.com', password: 'PasswordB1' };

async function registerAndGetToken(user) {
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.token;
}

describe('Jobs API', () => {
  let tokenA;
  let tokenB;

  beforeEach(async () => {
    tokenA = await registerAndGetToken(userA);
    tokenB = await registerAndGetToken(userB);
  });

  describe('POST /api/jobs', () => {
    it('creates a job for the authenticated user', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme Corp', role: 'Backend Engineer' });

      expect(res.status).toBe(201);
      expect(res.body.company).toBe('Acme Corp');
      expect(res.body.status).toBe('Applied');
    });

    it('rejects a request with no token', async () => {
      const res = await request(app).post('/api/jobs').send({ company: 'Acme', role: 'Eng' });
      expect(res.status).toBe(401);
    });

    it('rejects a job with no company', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ role: 'Engineer' });

      expect(res.status).toBe(400);
    });

    it('rejects an invalid status value', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer', status: 'NotARealStatus' });

      expect(res.status).toBe(400);
    });

    it('rejects a non-URL listing link', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer', link: 'not a url' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/jobs', () => {
    it('only returns jobs belonging to the authenticated user', async () => {
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'A-Corp', role: 'Eng' });
      await request(app).post('/api/jobs').set('x-auth-token', tokenB).send({ company: 'B-Corp', role: 'Eng' });

      const res = await request(app).get('/api/jobs').set('x-auth-token', tokenA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].company).toBe('A-Corp');
    });

    it('filters by status', async () => {
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'A', role: 'Eng', status: 'Applied' });
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'B', role: 'Eng', status: 'Offer' });

      const res = await request(app).get('/api/jobs?status=Offer').set('x-auth-token', tokenA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].company).toBe('B');
    });

    it('searches by company name, case-insensitively', async () => {
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'Globex Inc', role: 'Eng' });
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'Initech', role: 'Eng' });

      const res = await request(app).get('/api/jobs?search=globex').set('x-auth-token', tokenA);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].company).toBe('Globex Inc');
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it("updates a job belonging to the user", async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer' });

      const res = await request(app)
        .put(`/api/jobs/${createRes.body._id}`)
        .set('x-auth-token', tokenA)
        .send({ status: 'Interviewing' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Interviewing');
    });

    it("prevents a user from updating another user's job", async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer' });

      const res = await request(app)
        .put(`/api/jobs/${createRes.body._id}`)
        .set('x-auth-token', tokenB)
        .send({ status: 'Offer' });

      expect(res.status).toBe(404);
    });

    it('rejects an invalid id format', async () => {
      const res = await request(app)
        .put('/api/jobs/not-a-valid-id')
        .set('x-auth-token', tokenA)
        .send({ status: 'Offer' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('deletes a job belonging to the user', async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer' });

      const res = await request(app)
        .delete(`/api/jobs/${createRes.body._id}`)
        .set('x-auth-token', tokenA);

      expect(res.status).toBe(200);

      const stillThere = await Job.findById(createRes.body._id);
      expect(stillThere).toBeNull();
    });

    it("prevents a user from deleting another user's job", async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .set('x-auth-token', tokenA)
        .send({ company: 'Acme', role: 'Engineer' });

      const res = await request(app)
        .delete(`/api/jobs/${createRes.body._id}`)
        .set('x-auth-token', tokenB);

      expect(res.status).toBe(404);

      const stillThere = await Job.findById(createRes.body._id);
      expect(stillThere).not.toBeNull();
    });
  });

  describe('GET /api/jobs/stats', () => {
    it('returns correct counts by status', async () => {
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'A', role: 'Eng', status: 'Applied' });
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'B', role: 'Eng', status: 'Offer' });
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'C', role: 'Eng', status: 'Rejected' });

      const res = await request(app).get('/api/jobs/stats').set('x-auth-token', tokenA);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.byStatus.Applied).toBe(1);
      expect(res.body.byStatus.Offer).toBe(1);
      expect(res.body.byStatus.Rejected).toBe(1);
    });
  });

  describe('GET /api/jobs/export', () => {
    it('returns a CSV with a header row and the correct number of data rows', async () => {
      await request(app).post('/api/jobs').set('x-auth-token', tokenA).send({ company: 'Acme', role: 'Engineer' });

      const res = await request(app).get('/api/jobs/export').set('x-auth-token', tokenA);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      const lines = res.text.trim().split('\n');
      expect(lines[0]).toMatch(/Company,Role,Status/);
      expect(lines).toHaveLength(2); // header + 1 job
    });
  });
});
