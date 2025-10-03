import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// Hardcoded MongoDB connection per user request
const MONGODB_URI = 'mongodb+srv://admin:Bigpod2024@seriesmain.ieqlr6c.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'series-dataroom';
const COLLECTION_NAME = 'dataroom';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let client;
let collection;
let imagesCollection;

async function init() {
  client = new MongoClient(MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION_NAME);
  imagesCollection = db.collection('images');
  console.log(`Connected to MongoDB: ${DB_NAME}.${COLLECTION_NAME}`);
  await seedIfEmpty();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/dataroom', async (_req, res) => {
  try {
    const doc = await collection.findOne({ page: 'main', status: 'published' });
    res.json(doc ? { page: 'main', data: doc.data, version: doc.version } : { page: 'main', data: [], version: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dataroom data' });
  }
});

// Revisions API
async function getNextVersion() {
  const latest = await collection.find({ page: 'main' }).sort({ version: -1 }).limit(1).toArray();
  const maxVersion = latest.length ? latest[0].version || 0 : 0;
  return (maxVersion || 0) + 1;
}

// Default data for initial seed: Onboarding tile
const DEFAULT_DATA = [
  {
    title: 'Retention',
    header: 'Retention',
    metrics: [
      {
        title: 'D7 Rolling Across all Cohorts',
        value: '95.5%',
        description: 'A retained user is a user who on Dx opens and reads a message from their AI Friend',
        insight:
          'iMessage is the new application interface in which users can view and engage with one another.'
      },
      {
        title: 'Cohort 08-31',
        value: '',
        description: 'We looked at all the active users on 08-31 and tracked how they interacted with Series over 30 days',
        ctaText: 'View Graph',
        ctaLink: { type: 'image', imageSrc: '/retention_graph.png' },
        expandedData: [
          { label: 'D1 Rolling', value: '94.52%', description: 'Active Users from this cohort who returned on D1' },
          { label: 'D7 Rolling', value: '91.50%', description: 'Active Users from this cohort who returned on D7' },
          { label: 'D30 Rolling', value: '85%', description: 'Active Users from this cohort who returned on D30' },
          { label: 'D30 Across All Cohorts', value: '94.70%', description: 'Showcases healthy D30 average across 53 cohorts since the launch of v3', link: { type: 'image', imageSrc: '/retention_graph_2.jpeg' } }
        ]
      }
    ]
  },
  {
    title: 'Distribution',
    header: 'Distribution',
    metrics: [
      {
        title: 'Total Impressions Across 4 months',
        value: '≈350M',
        description: "Since the announcement of our pre-seed round we've garnered significant attention",
        insight:
          'We presume that around 20-30% of this viewage came from college entrepreneurs - our initial ICP'
      },
      {
        title: 'Forbes',
        value: '',
        description: 'https://www.forbes.com/sites/chriswestfall/2025/06/24/ai-investment-represents-new-gold-rush-for-investors-entrepreneurs/',
        link: { type: 'url', href: 'https://www.forbes.com/sites/chriswestfall/2025/06/24/ai-investment-represents-new-gold-rush-for-investors-entrepreneurs/' }
      },
      {
        title: 'TradedVc',
        value: '',
        description: 'https://traded.co/vc/articles/this-yale-senior-s-ai-social-network-helps-you-meet-your-co-founder-and-run-into-your-ex/',
        link: { type: 'url', href: 'https://traded.co/vc/articles/this-yale-senior-s-ai-social-network-helps-you-meet-your-co-founder-and-run-into-your-ex/' }
      },
      {
        title: 'BI',
        value: '',
        description: 'https://www.businessinsider.com/pitch-deck-series-gen-z-professional-network-ai-texting-2025-4',
        link: { type: 'url', href: 'https://www.businessinsider.com/pitch-deck-series-gen-z-professional-network-ai-texting-2025-4' }
      }
    ]
  },
  {
    title: 'Conversion',
    header: 'To understand why they try Series',
    metrics: [
      {
        title: 'Website Visits (all-time)',
        value: '1.5M',
        description: "Since the announcement of our pre-seed round we've garnered significant attention",
        insight:
          'We presume that around 20-30% of this viewage came from college entrepreneurs - our initial ICP'
      },
      {
        title: 'Avg CTA Click-Through Rate',
        value: '≈40%',
        description: 'This is 10x most benchmarks most marketplace CTA rates which range from 2–5%',
        expandedData: [
          { label: 'Page view (1)', value: '100%', description: 'We have 22,925 visits to our website last month' },
          { label: 'Button Click CTA (2)', value: '36.11%', description: '8,279 individuals last month clicked on our CTA from those who came from step (1)' },
          { label: 'Modal Submission (3)', value: '16.1%', description: '3,692 individuals last month inputed their information on our modal and submit it' },
          { label: 'Registered User (4)', value: '10%', description: '2,293 individuals last month opened iMessage after (3) and texted their AI Friend' }
        ]
      }
    ]
  },
  {
    title: 'User Data',
    header: 'To understand who is using Series',
    metrics: [
      {
        title: 'Profiles',
        value: '313,230',
        description: 'Enriched data we have on students and their warm networks via google calendar',
        insight: 'Each Profile includes Email, Name, DOB, Age, University and social context of who they know'
      },
      {
        title: 'User Count',
        value: '29,375',
        description: 'A user is defined as someone who has signed up via Series.so and has sent +1 messages to their AI Friends',
        expandedData: [
          { label: 'Student Density', value: '90%', description: 'We focused on building a dense network of students interested in entrepreneurship' },
          { label: 'Active Users', value: '13,979', description: 'Users that have finished onboarding via text and has read +1 messages from AI Friend' },
          { label: 'Waitlist Users', value: '5,814', description: 'Users who have texted their AI Friend and sent +1 messages but are above the age rec' }
        ]
      },
      {
        title: 'College Entrepreneurship Density',
        value: '90%',
        description: 'Our users are looking to make professional connections to further their careers as current or future entrepreneurs.',
        expandedData: [
          { label: 'Universities', value: '650+', description: 'Spanning across 6 continents with a strong focus in the United States' },
          { label: 'Ivy League Density', value: '35%', description: 'We started with a high-value network of college students' },
          { label: 'Median User Age', value: '90%', description: 'Our users are college students who average age 18–22' }
        ]
      }
    ]
  }
];

async function seedIfEmpty() {
  const count = await collection.countDocuments({ page: 'main' });
  if (count === 0) {
    const now = new Date().toISOString();
    await collection.insertOne({
      page: 'main',
      version: 1,
      status: 'draft',
      data: DEFAULT_DATA,
      createdAt: now,
      updatedAt: now,
    });
    console.log('Seeded initial draft revision v1');
  }
}

app.get('/api/revisions', async (_req, res) => {
  try {
    const docs = await collection
      .find({ page: 'main' })
      .project({ data: 0 })
      .sort({ version: -1, minor: -1, updatedAt: -1 })
      .toArray();
    res.json(docs.map((d) => ({
      version: d.version,
      minor: d.minor ?? 0,
      status: d.status || 'draft',
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list revisions' });
  }
});

app.get('/api/revisions/:version', async (req, res) => {
  try {
    const version = Number(req.params.version);
    const minor = req.query.minor != null ? Number(req.query.minor) : undefined;
    let doc;
    if (minor != null && !Number.isNaN(minor)) {
      doc = await collection.findOne({ page: 'main', version, minor });
    } else {
      // default to published for that major
      doc = await collection.findOne({ page: 'main', version, status: 'published' });
      if (!doc) {
        // fallback to latest draft minor
        doc = await collection.find({ page: 'main', version })
          .sort({ minor: -1 })
          .limit(1)
          .next();
      }
    }
    if (!doc) return res.status(404).json({ error: 'Revision not found' });
    res.json({ version: doc.version, minor: doc.minor ?? 0, status: doc.status, data: doc.data, createdAt: doc.createdAt, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch revision' });
  }
});

app.post('/api/revisions', async (req, res) => {
  try {
    const body = req.body || {};
    // Base drafts on next major after currently published
    const currentPublished = await collection.find({ page: 'main', status: 'published' })
      .sort({ version: -1 })
      .limit(1)
      .toArray();
    const baseMajor = currentPublished.length ? (currentPublished[0].version || 0) : 0;
    const version = baseMajor + 1;
    const latestForMajor = await collection.find({ page: 'main', version }).sort({ minor: -1 }).limit(1).toArray();
    const nextMinor = latestForMajor.length ? ((latestForMajor[0].minor || 0) + 1) : 1;
    const now = new Date().toISOString();
    const doc = {
      page: 'main',
      version,
      minor: nextMinor,
      status: 'draft',
      data: body.data ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await collection.insertOne(doc);
    res.json({ ok: true, version, minor: nextMinor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create revision' });
  }
});

app.put('/api/revisions/:version', async (req, res) => {
  try {
    const version = Number(req.params.version);
    const minor = req.query.minor != null ? Number(req.query.minor) : undefined;
    const body = req.body || {};
    const filter = { page: 'main', version, status: 'draft' };
    if (minor != null && !Number.isNaN(minor)) Object.assign(filter, { minor });
    const result = await collection.updateOne(
      filter,
      { $set: { data: body.data ?? [], updatedAt: new Date().toISOString() } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: 'Draft revision not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update revision' });
  }
});

app.post('/api/publish/:version', async (req, res) => {
  try {
    const version = Number(req.params.version);
    const minor = req.query.minor != null ? Number(req.query.minor) : undefined;
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const now = new Date().toISOString();
        let target;
        if (minor != null && !Number.isNaN(minor)) {
          target = await collection.findOne({ page: 'main', version, minor }, { session });
        } else {
          // publish the latest draft for this major
          target = await collection.find({ page: 'main', version, status: { $ne: 'archived' } }, { session })
            .sort({ minor: -1 })
            .limit(1)
            .next();
        }
        if (!target) throw new Error('Target revision not found');
        // Ensure target is saved as a draft or any state before publishing
        if (!target.status || target.status === 'published') {
          await collection.updateOne(
            { _id: target._id },
            { $set: { status: 'draft', updatedAt: now } },
            { session }
          );
        }
        const current = await collection.findOne({ page: 'main', status: 'published' }, { session });
        if (current) {
          await collection.updateOne(
            { _id: current._id },
            { $set: { status: 'archived', updatedAt: now } },
            { session }
          );
        }
        await collection.updateOne(
          { _id: target._id },
          { $set: { status: 'published', minor: 0, updatedAt: now } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish revision' });
  }
});

// Image upload and serve
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/images', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const doc = {
      data: req.file.buffer,
      contentType: req.file.mimetype || 'application/octet-stream',
      originalName: req.file.originalname,
      createdAt: new Date().toISOString(),
    };
    const result = await imagesCollection.insertOne(doc);
    res.json({ id: result.insertedId.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await imagesCollection.findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).send('Not found');
    res.setHeader('Content-Type', doc.contentType || 'application/octet-stream');
    res.send(doc.data.buffer ? Buffer.from(doc.data.buffer) : doc.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

init()
  .then(() => {
    // In production, serve built frontend from /dist
    if (process.env.NODE_ENV === 'production') {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const distPath = path.resolve(__dirname, '../dist');

      app.use(express.static(distPath));

      // SPA fallback to index.html
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize server', err);
    process.exit(1);
  });
