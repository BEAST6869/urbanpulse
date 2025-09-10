import 'dotenv/config';
import mongoose from 'mongoose';
import Report from '../backend/models/Report.js';

const SAMPLE = [
  { description: 'Large pothole near Market Road', imageUrl: 'https://via.placeholder.com/600', coordinates: [77.5847,12.9719], category:'pothole' },
  { description: 'Overflowing garbage bin', imageUrl: 'https://via.placeholder.com/600', coordinates: [77.5900,12.9750], category:'garbage' },
  { description: 'Streetlight not working', imageUrl: 'https://via.placeholder.com/600', coordinates: [77.5950,12.9680], category:'streetlight' },
  { description: 'Multiple potholes cluster', imageUrl: 'https://via.placeholder.com/600', coordinates: [77.5850,12.9690], category:'pothole' },
  { description: 'Garbage around bus stop', imageUrl: 'https://via.placeholder.com/600', coordinates: [77.6000,12.9700], category:'garbage' }
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('Connected to MongoDB — clearing and seeding sample data.');
  await Report.deleteMany({});

  const docs = SAMPLE.map(s => ({
    description: s.description,
    imageUrl: s.imageUrl,
    location: { type: 'Point', coordinates: s.coordinates },
    category: s.category,
    confidence: Math.random() * 0.2 + 0.75,
    status: 'Reported',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await Report.create(docs);
  await Report.init(); // ensure indexes
  console.log('✅ Seeded', docs.length, 'reports');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
