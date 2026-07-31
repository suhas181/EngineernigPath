import { MongoClient } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/engineerpath';
const ATLAS_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function migrate() {
  console.log('--------------------------------------------------');
  console.log('🚀 MONGODB LOCAL TO ATLAS MIGRATION TOOL');
  console.log('--------------------------------------------------');
  console.log(`Source (Local):  ${LOCAL_URI}`);
  console.log(`Target (Atlas):  ${ATLAS_URI ? ATLAS_URI.replace(/:([^:@]+)@/, ':****@') : 'Not Configured'}`);
  console.log('--------------------------------------------------');

  if (!ATLAS_URI || ATLAS_URI.includes('<username>') || ATLAS_URI.includes('<password>')) {
    console.error('❌ Error: Valid Atlas MONGODB_URI is not set in environment variables.');
    process.exit(1);
  }

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    console.log('Connecting to Local MongoDB...');
    await localClient.connect();
    console.log('✅ Connected to Local MongoDB.');

    console.log('Connecting to MongoDB Atlas...');
    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas.');

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    const collections = await localDb.listCollections().toArray();

    if (collections.length === 0) {
      console.log('⚠️  No collections found in local database to migrate.');
      return;
    }

    console.log(`\nFound ${collections.length} collection(s) in local database:`);
    console.log('--------------------------------------------------');

    let totalMigratedDocs = 0;

    for (const col of collections) {
      const colName = col.name;
      const localCollection = localDb.collection(colName);
      const atlasCollection = atlasDb.collection(colName);

      const count = await localCollection.countDocuments();
      if (count === 0) {
        console.log(`📦 Collection "${colName}": 0 documents (skipped)`);
        continue;
      }

      console.log(`📦 Migrating "${colName}" (${count} documents)...`);
      const docs = await localCollection.find({}).toArray();

      try {
        // Bulk upsert/insert docs into Atlas
        const result = await atlasCollection.insertMany(docs, { ordered: false });
        console.log(`   ✅ Inserted ${result.insertedCount} documents into Atlas collection "${colName}".`);
        totalMigratedDocs += result.insertedCount;
      } catch (err: any) {
        if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
          const insertedCount = err.result?.nInserted || 0;
          console.log(`   ⚠️  Partial migration for "${colName}": ${insertedCount} new docs inserted (${count - insertedCount} already existed in Atlas).`);
          totalMigratedDocs += insertedCount;
        } else {
          console.error(`   ❌ Error migrating "${colName}":`, err.message);
        }
      }
    }

    console.log('--------------------------------------------------');
    console.log(`🎉 MIGRATION COMPLETE! Total ${totalMigratedDocs} document(s) synced to Atlas.`);
    console.log('--------------------------------------------------');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
    console.log('Connections closed cleanly.');
  }
}

migrate();
