import 'dotenv/config';
import mongoose from 'mongoose';
import Report from '../backend/models/Report.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('Running migration: add resolvedAt=null where missing');
  const result = await Report.updateMany(
    { resolvedAt: { $exists: false } },
    { $set: { resolvedAt: null } }
  );
  console.log(`✅ Updated ${result.modifiedCount} documents`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
