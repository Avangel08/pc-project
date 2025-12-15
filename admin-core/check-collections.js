import mongoose from 'mongoose';
const MONGODB_URI = 'mongodb://localhost:27017/admin_panel';

async function checkCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    if (collections.length > 0) {
      const reviews = await db.collection(collections[0].name).find().toArray();
      console.log('Total documents:', reviews.length);
      if (reviews.length > 0) {
        console.log('Sample:', reviews[0]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkCollections();
