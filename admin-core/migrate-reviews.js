import mongoose from 'mongoose';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = 'mongodb://localhost:27017/pc-shop';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  customerId: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  helpful: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  reportReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

async function migrateReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const reviewsPath = join(__dirname, 'reviews.json');
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    console.log(`Found ${reviewsData.length} reviews to migrate`);

    await Review.deleteMany({});
    console.log('Cleared existing reviews in MongoDB');

    for (const review of reviewsData) {
      // Convert date string to Date object (if needed)
      let reviewDate = new Date();
      if (review.date && !isNaN(Number(review.date))) {
        // Nếu date là timestamp dạng string, chuyển sang Date
        reviewDate = new Date(Number(review.date));
      }
      const newReview = new Review({
        ...review,
        createdAt: reviewDate,
        updatedAt: reviewDate
      });
      await newReview.save();
    }
    console.log(`Successfully migrated ${reviewsData.length} reviews to MongoDB`);
    const count = await Review.countDocuments();
    console.log(`Total reviews in MongoDB: ${count}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateReviews(); 