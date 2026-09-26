import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  CreateNoteSchema,
  LeadQuerySchema,
} from '../validation.js';

export const leadsRouter = Router();

// Helper to validate and parse integer ID
function parseLeadId(idParam: string | string[] | undefined): number | null {
  if (typeof idParam !== 'string') {
    return null;
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) {
    return null;
  }
  return id;
}

/**
 * GET /api/leads
 * Query params: search (name/email), status (new/contacted/qualified/lost), page, limit
 */
leadsRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = LeadQuerySchema.parse(req.query);
    const { search, status, page, limit } = query;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      where.OR = [
        { name: { contains: trimmedSearch } },
        { email: { contains: trimmedSearch } },
      ];
    }

    const total = await prisma.lead.count({ where });

    const leads = await prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      data: leads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leads
 * Body: { name, email, phone, status? }
 */
leadsRouter.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = CreateLeadSchema.parse(req.body);

    const newLead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        status: validatedData.status,
      },
    });

    res.status(201).json(newLead);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id
 * Returns single lead with notes
 */
leadsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseLeadId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid lead ID. Must be a positive integer.' });
      return;
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      res.status(404).json({ error: `Lead with ID ${id} not found` });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/leads/:id
 * Body: partial { name, email, phone, status }
 */
leadsRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseLeadId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid lead ID. Must be a positive integer.' });
      return;
    }

    const validatedData = UpdateLeadSchema.parse(req.body);

    // Check if lead exists
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: `Lead with ID ${id} not found` });
      return;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/leads/:id
 */
leadsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseLeadId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid lead ID. Must be a positive integer.' });
      return;
    }

    // Check if lead exists
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: `Lead with ID ${id} not found` });
      return;
    }

    await prisma.lead.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Lead deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leads/:id/notes
 * Returns all notes for a specific lead
 */
leadsRouter.get('/:id/notes', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseLeadId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid lead ID. Must be a positive integer.' });
      return;
    }

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lead) {
      res.status(404).json({ error: `Lead with ID ${id} not found` });
      return;
    }

    const notes = await prisma.note.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leads/:id/notes
 * Body: { content }
 */
leadsRouter.post('/:id/notes', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseLeadId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid lead ID. Must be a positive integer.' });
      return;
    }

    const validatedData = CreateNoteSchema.parse(req.body);

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lead) {
      res.status(404).json({ error: `Lead with ID ${id} not found` });
      return;
    }

    const newNote = await prisma.note.create({
      data: {
        leadId: id,
        content: validatedData.content,
      },
    });

    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
});
