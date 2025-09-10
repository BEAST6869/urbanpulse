# UrbanPulse Backend Setup

## Prerequisites

1. **MongoDB Atlas Account**: Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Cloudinary Account**: Create a free account at [Cloudinary](https://cloudinary.com/)

## Environment Configuration

1. Copy the `.env` file and update the following variables:

### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/urbanpulse?retryWrites=true&w=majority
```

To get your MongoDB URI:
1. Log into MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string and replace `<password>` with your database password

### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

To get your Cloudinary credentials:
1. Log into Cloudinary
2. Go to Dashboard
3. Copy the Cloud Name, API Key, and API Secret

## Starting the Server

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Start production server:
```bash
npm start
```

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/reports` - Create a new report (supports multipart/form-data for images)
- `GET /api/reports` - Get all reports (with filtering, pagination, geospatial search)
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id/status` - Update report status
- `GET /api/stats` - Get comprehensive statistics

## Features

✅ **MongoDB Integration**: Full database connectivity with Mongoose ODM
✅ **Geospatial Indexing**: 2dsphere index for location-based queries
✅ **Image Uploads**: Cloudinary integration with automatic image optimization
✅ **File Upload**: Multer middleware with size limits and type validation
✅ **Error Handling**: Comprehensive error handling and validation
✅ **Security**: Helmet, CORS, and proper middleware configuration
✅ **Logging**: Morgan HTTP request logging
✅ **Statistics**: Advanced aggregation pipelines for analytics

## Testing Without Database

To test the API structure without setting up MongoDB:
1. Comment out the `connectDB()` line in `index.js`
2. The endpoints will return appropriate error messages but the server will start
