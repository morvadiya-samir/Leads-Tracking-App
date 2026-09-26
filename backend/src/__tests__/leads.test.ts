import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db.js';

describe('Leads API Routes', () => {
  let createdLeadId: number;
  const username = process.env.BASIC_AUTH_USER || 'admin';
  const password = process.env.BASIC_AUTH_PASS || 'password123';

  // Helper to attach Basic Auth if enabled
  const withAuth = (req: request.Test) => {
    if (process.env.BASIC_AUTH_ENABLED === 'true') {
      return req.auth(username, password);
    }
    return req;
  };

  beforeAll(async () => {
    // Ensure clean state for test lead
    await prisma.lead.deleteMany({
      where: { email: 'test.user@automated-spec.com' },
    });
  });

  afterAll(async () => {
    if (createdLeadId) {
      await prisma.lead.deleteMany({ where: { id: createdLeadId } });
    }
    await prisma.$disconnect();
  });

  it('GET /api/leads without credentials should return 401 when auth is enabled', async () => {
    if (process.env.BASIC_AUTH_ENABLED === 'true') {
      const res = await request(app).get('/api/leads');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    }
  });

  it('GET /api/leads should return list of leads with pagination', async () => {
    const res = await withAuth(request(app).get('/api/leads'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page', 1);
  });

  it('POST /api/leads should create a new lead with valid data', async () => {
    const payload = {
      name: 'Automated Test User',
      email: 'test.user@automated-spec.com',
      phone: '+1 555 999 8888',
      status: 'new',
    };

    const res = await withAuth(request(app).post('/api/leads')).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(payload.name);
    expect(res.body.email).toBe(payload.email);
    expect(res.body.status).toBe('new');

    createdLeadId = res.body.id;
  });

  it('POST /api/leads should return 400 when email format is invalid', async () => {
    const invalidPayload = {
      name: 'Invalid Email Person',
      email: 'not-an-email',
      phone: '+1 555 111 2222',
      status: 'new',
    };

    const res = await withAuth(request(app).post('/api/leads')).send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
      ])
    );
  });

  it('GET /api/leads/:id should return single lead with notes', async () => {
    const res = await withAuth(request(app).get(`/api/leads/${createdLeadId}`));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdLeadId);
    expect(res.body).toHaveProperty('notes');
    expect(Array.isArray(res.body.notes)).toBe(true);
  });

  it('POST /api/leads/:id/notes should add a note to the lead', async () => {
    const notePayload = { content: 'First automated test note for this lead.' };
    const res = await withAuth(request(app).post(`/api/leads/${createdLeadId}/notes`))
      .send(notePayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.leadId).toBe(createdLeadId);
    expect(res.body.content).toBe(notePayload.content);
  });

  it('PATCH /api/leads/:id should update lead status', async () => {
    const updatePayload = { status: 'qualified' };
    const res = await withAuth(request(app).patch(`/api/leads/${createdLeadId}`))
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('qualified');
  });

  it('GET /api/leads/:id should return 404 for non-existent lead', async () => {
    const res = await withAuth(request(app).get('/api/leads/99999999'));
    expect(res.status).toBe(404);
  });
});
