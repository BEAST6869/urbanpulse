const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Report = require('../models/Report');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'admin@urbanpulse.app',
    password: 'AdminPass123!',
    role: 'admin',
    phone: '+1-555-0001',
    isEmailVerified: true,
    address: {
      street: '123 Admin Street',
      city: 'Metro City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@city.gov',
    password: 'WorkerPass123!',
    role: 'municipal_worker',
    department: 'public_works',
    phone: '+1-555-0002',
    isEmailVerified: true,
    address: {
      street: '456 City Hall Ave',
      city: 'Metro City',
      state: 'CA',
      zipCode: '90211',
      country: 'USA'
    }
  },
  {
    name: 'Mike Johnson',
    email: 'mike.transport@city.gov',
    password: 'WorkerPass123!',
    role: 'municipal_worker',
    department: 'transportation',
    phone: '+1-555-0003',
    isEmailVerified: true
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@email.com',
    password: 'CitizenPass123!',
    role: 'citizen',
    phone: '+1-555-0004',
    isEmailVerified: true,
    address: {
      street: '789 Resident Lane',
      city: 'Metro City',
      state: 'CA',
      zipCode: '90212',
      country: 'USA'
    }
  },
  {
    name: 'David Garcia',
    email: 'david.garcia@email.com',
    password: 'CitizenPass123!',
    role: 'citizen',
    phone: '+1-555-0005',
    isEmailVerified: true
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    password: 'CitizenPass123!',
    role: 'citizen',
    phone: '+1-555-0006',
    isEmailVerified: false
  }
];

// Sample reports data (will be linked to users after creation)
const sampleReportsTemplate = [
  {
    title: 'Pothole on Main Street',
    description: 'Large pothole causing damage to vehicles. Located near the intersection of Main St and 1st Ave. Has been growing larger over the past month.',
    category: 'infrastructure',
    priority: 'high',
    location: {
      type: 'Point',
      coordinates: [-118.2437, 34.0522] // Los Angeles coordinates
    },
    address: '123 Main Street, Metro City, CA 90210',
    status: 'pending'
  },
  {
    title: 'Broken Streetlight',
    description: 'Streetlight has been out for over a week, creating safety concerns for pedestrians at night.',
    category: 'infrastructure',
    priority: 'medium',
    location: {
      type: 'Point',
      coordinates: [-118.2427, 34.0532]
    },
    address: '456 Oak Avenue, Metro City, CA 90211',
    status: 'in_progress'
  },
  {
    title: 'Illegal Dumping Site',
    description: 'Someone has been dumping construction waste in the vacant lot. Strong odor and potential environmental hazard.',
    category: 'environment',
    priority: 'high',
    location: {
      type: 'Point',
      coordinates: [-118.2447, 34.0512]
    },
    address: '789 Industrial Blvd, Metro City, CA 90212',
    status: 'pending'
  },
  {
    title: 'Traffic Signal Malfunction',
    description: 'Traffic light stuck on red in all directions, causing major traffic backup during rush hours.',
    category: 'transportation',
    priority: 'critical',
    location: {
      type: 'Point',
      coordinates: [-118.2457, 34.0542]
    },
    address: 'Intersection of Highway 101 and Broadway, Metro City, CA',
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Graffiti on Public Building',
    description: 'Vandalism on the side of the community center building. Multiple spray paint tags.',
    category: 'public_services',
    priority: 'low',
    location: {
      type: 'Point',
      coordinates: [-118.2467, 34.0552]
    },
    address: '321 Community Center Dr, Metro City, CA 90213',
    status: 'pending'
  },
  {
    title: 'Park Bench Needs Repair',
    description: 'Wooden bench in Central Park has broken slats and is unsafe to sit on.',
    category: 'public_services',
    priority: 'low',
    location: {
      type: 'Point',
      coordinates: [-118.2417, 34.0562]
    },
    address: 'Central Park, Metro City, CA 90210',
    status: 'in_progress'
  },
  {
    title: 'Water Main Leak',
    description: 'Water bubbling up from street, possible water main break. Water pressure low in surrounding area.',
    category: 'infrastructure',
    priority: 'critical',
    location: {
      type: 'Point',
      coordinates: [-118.2477, 34.0572]
    },
    address: '654 Water Street, Metro City, CA 90214',
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: 'Noise Complaint - Construction',
    description: 'Construction work starting before permitted hours (before 7 AM) causing noise disturbance.',
    category: 'safety',
    priority: 'medium',
    location: {
      type: 'Point',
      coordinates: [-118.2487, 34.0582]
    },
    address: '987 Development Ave, Metro City, CA 90215',
    status: 'pending'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create reports with user references
    console.log('📋 Creating reports...');
    const citizens = createdUsers.filter(user => user.role === 'citizen');
    const admin = createdUsers.find(user => user.role === 'admin');
    const publicWorksWorker = createdUsers.find(user => user.department === 'public_works');
    const transportWorker = createdUsers.find(user => user.department === 'transportation');

    const reportsWithUsers = sampleReportsTemplate.map((report, index) => {
      const citizen = citizens[index % citizens.length];
      const reportWithUser = {
        ...report,
        userId: citizen._id,
        reporter: {
          name: citizen.name,
          email: citizen.email,
          phone: citizen.phone
        }
      };

      // Assign workers to in-progress and resolved reports
      if (report.status === 'in_progress' || report.status === 'resolved') {
        if (report.category === 'transportation') {
          reportWithUser.assignedTo = transportWorker._id;
        } else {
          reportWithUser.assignedTo = publicWorksWorker._id;
        }
      }

      return reportWithUser;
    });

    const createdReports = await Report.create(reportsWithUsers);
    console.log(`✅ Created ${createdReports.length} reports`);

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Users: ${createdUsers.length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`   - Municipal Workers: ${createdUsers.filter(u => u.role === 'municipal_worker').length}`);
    console.log(`   - Citizens: ${createdUsers.filter(u => u.role === 'citizen').length}`);
    console.log(`📋 Reports: ${createdReports.length}`);
    console.log(`   - Pending: ${createdReports.filter(r => r.status === 'pending').length}`);
    console.log(`   - In Progress: ${createdReports.filter(r => r.status === 'in_progress').length}`);
    console.log(`   - Resolved: ${createdReports.filter(r => r.status === 'resolved').length}`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin: admin@urbanpulse.app / AdminPass123!');
    console.log('Municipal Worker: sarah.wilson@city.gov / WorkerPass123!');
    console.log('Citizen: alice.brown@email.com / CitizenPass123!');
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Seeding process failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase, sampleUsers, sampleReportsTemplate };
