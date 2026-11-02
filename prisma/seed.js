const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Apartment Management database...');

  // Clean existing data
  await prisma.adminApproval.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.requirementApplication.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.requestStatusHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceAvailability.deleteMany();
  await prisma.serviceListing.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.providerDocument.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.community.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Create Community
  const community = await prisma.community.create({
    data: {
      name: 'Palm Heights Luxury Residences',
      code: 'PALM-BLR-01',
      address: 'Outer Ring Road, Bellandur, Marathahalli Junction',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      totalBlocks: 4,
      totalFlats: 280,
      heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      noticesJson: JSON.stringify([
        {
          id: 'not-1',
          title: 'Monsoon Balcony & Drain Line Pre-checks',
          date: 'Nov 02, 2026',
          category: 'MAINTENANCE',
          content: 'Plumbing and housekeeping teams will inspect all terrace outlets and balcony drain points this Saturday from 10 AM to 4 PM.',
          important: true
        },
        {
          id: 'not-2',
          title: 'Annual General Body Meeting (AGM)',
          date: 'Nov 08, 2026',
          category: 'COMMUNITY',
          content: 'Join us at the Central Clubhouse Banquet Hall on Sunday at 10:30 AM for the annual society review and financial briefing.',
          important: false
        },
        {
          id: 'not-3',
          title: 'Basement-2 EV Charging Points Expansion',
          date: 'Nov 12, 2026',
          category: 'INFRASTRUCTURE',
          content: 'Installation of 8 additional Level-2 AC chargers will begin in Block C basement. Please avoid parking in bays 40-48 during work.',
          important: false
        }
      ])
    }
  });

  console.log('Community created:', community.name);

  // 2. Create Users (Admin, Management, Residents, Providers)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@palmheights.com',
      passwordHash,
      name: 'Vikramaditya Rao',
      phone: '+91 98450 11001',
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@palmheights.com',
      passwordHash,
      name: 'Sunita Deshmukh',
      phone: '+91 98450 11002',
      role: 'MANAGEMENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community.id,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
    }
  });

  const resident1 = await prisma.user.create({
    data: {
      email: 'rahul.sharma@gmail.com',
      passwordHash,
      name: 'Rahul Sharma',
      phone: '+91 98860 33441',
      role: 'RESIDENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      residentProfile: {
        create: {
          alternatePhone: '+91 98860 33442',
          familyMembersCount: 4,
          intercomNumber: '2304',
          bio: 'Tech lead living in Tower B with family. Avid badminton player.'
        }
      },
      communityMembers: {
        create: {
          communityId: community.id,
          block: 'Tower B',
          flatNumber: '304',
          residentType: 'OWNER',
          isVerified: true
        }
      }
    }
  });

  const resident2 = await prisma.user.create({
    data: {
      email: 'priya.patel@gmail.com',
      passwordHash,
      name: 'Priya Patel',
      phone: '+91 97400 55662',
      role: 'RESIDENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community.id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      residentProfile: {
        create: {
          alternatePhone: '+91 97400 55663',
          familyMembersCount: 3,
          intercomNumber: '11202',
          bio: 'Product designer in Tower A. Plant parent & baker.'
        }
      },
      communityMembers: {
        create: {
          communityId: community.id,
          block: 'Tower A',
          flatNumber: '1202',
          residentType: 'OWNER',
          isVerified: true
        }
      }
    }
  });

  // 3. Create Service Categories & Subcategories (6 client groups)
  const categoriesData = [
    {
      name: 'Home Maintenance',
      slug: 'home-maintenance',
      group: 'HOME_MAINTENANCE',
      description: 'Expert repairs, wiring, plumbing, carpentry and appliance diagnostics right at your doorstep.',
      icon: 'Wrench',
      launchStatus: 'LAUNCHED',
      sortOrder: 1,
      subcategories: [
        { name: 'Plumber', slug: 'plumber', icon: 'Pipette', desc: 'Tap repair, water leakage, pipe replacement, bathroom & kitchen fittings' },
        { name: 'Electrician', slug: 'electrician', icon: 'Zap', desc: 'Switch/socket repair, fan installation, lighting, wiring, MCB troubleshooting' },
        { name: 'Carpenter', slug: 'carpenter', icon: 'Hammer', desc: 'Furniture repairs, door hinges, modular kitchen repairs, custom shelves' },
        { name: 'Painter', slug: 'painter', icon: 'Paintbrush', desc: 'Touch-up painting, accent walls, waterproofing coating, interior repainting' },
        { name: 'AC Service', slug: 'ac-service', icon: 'Wind', desc: 'Filter cleaning, deep coil foam wash, gas leak detection and refilling' },
        { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Cpu', desc: 'Washing machine, refrigerator, microwave and chimney service' },
        { name: 'RO / Water Purifier', slug: 'ro-water-purifier', icon: 'Droplets', desc: 'Sediment/carbon filter replacement, membrane service, TDS tuning' }
      ]
    },
    {
      name: 'Cleaning & Housekeeping',
      slug: 'cleaning-housekeeping',
      group: 'CLEANING_HOUSEKEEPING',
      description: 'Professional deep sanitization, maid support, sofa upholstery wash and eco-friendly pest control.',
      icon: 'Sparkles',
      launchStatus: 'LAUNCHED',
      sortOrder: 2,
      subcategories: [
        { name: 'Apartment Cleaning Maid', slug: 'apartment-cleaning-maid', icon: 'Home', desc: 'Daily dusting, sweeping, mopping, utensil washing and balcony upkeep' },
        { name: 'Deep Cleaning', slug: 'deep-cleaning', icon: 'ShieldCheck', desc: 'Intensive scrubbing of kitchen tiles, exhaust chimney, grout lines and windows' },
        { name: 'Specialized Cleaning', slug: 'specialized-cleaning', icon: 'Armchair', desc: 'Fabric sofa shampooing, woollen carpet extraction, mattress sanitization' },
        { name: 'Pest Control', slug: 'pest-control', icon: 'Bug', desc: 'Odorless cockroach gel treatment, bedbug eradication, anti-termite shield' }
      ]
    },
    {
      name: 'Vehicle Care',
      slug: 'vehicle',
      group: 'VEHICLE',
      description: 'Doorstep basement car washing, detailing, bike service and instant puncture assistance.',
      icon: 'Car',
      launchStatus: 'LAUNCHED',
      sortOrder: 3,
      subcategories: [
        { name: 'Car Washing', slug: 'car-washing', icon: 'Car', desc: 'Daily/alternate morning foam wash, tire dressing and glass wipe in basement' },
        { name: 'Car Detailing', slug: 'car-detailing', icon: 'Sparkle', desc: 'Clay bar treatment, 3M machine polishing, interior steam deodorization' },
        { name: 'Bike Washing', slug: 'bike-washing', icon: 'Bike', desc: 'High-pressure foam wash, chain lubrication and chrome buffing' },
        { name: 'Vehicle Services', slug: 'vehicle-services', icon: 'Fuel', desc: 'Jump start, emergency flat tire change, brake pad inspection, pickup/drop' }
      ]
    },
    {
      name: 'Household & Personal',
      slug: 'household-personal',
      group: 'HOUSEHOLD_PERSONAL',
      description: 'Verified home chefs, elderly companions, babysitters, laundry ironing and wellness coaches.',
      icon: 'Users',
      launchStatus: 'LAUNCHED',
      sortOrder: 4,
      subcategories: [
        { name: 'Cook / Chef', slug: 'cook', icon: 'Soup', desc: 'North/South Indian home meals, diabetic diets, meal prep for families' },
        { name: 'Babysitter & Nanny', slug: 'babysitter', icon: 'Baby', desc: 'Attentive infant care, toddler engagement, after-school supervision' },
        { name: 'Elder-care Assistance', slug: 'elder-care', icon: 'HeartHandshake', desc: 'Daily companionship, medicine reminders, assisted evening walking' },
        { name: 'Driver on Demand', slug: 'driver', icon: 'Compass', desc: 'Airport transfers, outstation drives, hourly local chauffeur service' },
        { name: 'Laundry & Ironing', slug: 'laundry-ironing', icon: 'Shirt', desc: 'Steam press at doorstep, wash & fold, dry cleaning collection' },
        { name: 'Beauty & Home Salon', slug: 'beauty-salon', icon: 'Smile', desc: 'Pedicure, facial, haircut, hair spa and bridal styling in your home' },
        { name: 'Yoga & Fitness Trainer', slug: 'yoga-fitness', icon: 'Activity', desc: '1-on-1 morning yoga, posture correction, strength coaching at society gym' }
      ]
    },
    {
      name: 'Education & Skills',
      slug: 'education-skills',
      group: 'EDUCATION_SKILLS',
      description: 'Verified society tutors, coding instructors, guitar and vocal teachers for kids and adults.',
      icon: 'GraduationCap',
      launchStatus: 'LAUNCHING_NOW',
      sortOrder: 5,
      subcategories: [
        { name: 'Home Tuition (Math & Science)', slug: 'home-tuition', icon: 'BookOpen', desc: 'CBSE / ICSE / IB curriculum guidance for Class 6 to 12' },
        { name: 'Spoken English & Public Speaking', slug: 'spoken-english', icon: 'Mic', desc: 'Accent softening, confidence building, presentation skills' },
        { name: 'Coding & Web Development', slug: 'coding-programming', icon: 'Code', desc: 'Python, Scratch for kids, JavaScript, HTML/CSS project tutoring' },
        { name: 'Music (Guitar & Keyboard)', slug: 'music-instruments', icon: 'Music', desc: 'Acoustic guitar chords, Trinity keyboard grades, sheet reading' },
        { name: 'Drawing & Painting', slug: 'drawing-painting', icon: 'Palette', desc: 'Watercolors, oil pastels, sketch theory, canvas workshops' }
      ]
    },
    {
      name: 'Professional Services',
      slug: 'professional',
      group: 'PROFESSIONAL',
      description: 'Chartered Accountants, legal document advisors, corporate photography and web consulting.',
      icon: 'Briefcase',
      launchStatus: 'LAUNCHED',
      sortOrder: 6,
      subcategories: [
        { name: 'Chartered Accountant / Tax', slug: 'ca-tax-gst', icon: 'FileText', desc: 'ITR filing, capital gains calculation, GST compliance and audit advisory' },
        { name: 'Legal Consultation', slug: 'legal-consultation', icon: 'Scale', desc: 'Property title verification, rental agreements, power of attorney reviews' },
        { name: 'Photography & Videography', slug: 'photography', icon: 'Camera', desc: 'Family portraits, birthday coverage, society events, drone shoots' },
        { name: 'Website & App Development', slug: 'tech-software', icon: 'Monitor', desc: 'Custom business web portals, SaaS mvp development, UI/UX consultation' }
      ]
    }
  ];

  const categoryMap = {};
  const subCategoryMap = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        group: cat.group,
        launchStatus: cat.launchStatus,
        sortOrder: cat.sortOrder,
        isActive: true,
        subCategories: {
          create: cat.subcategories.map((sub, idx) => ({
            name: sub.name,
            slug: sub.slug,
            description: sub.desc,
            icon: sub.icon,
            sortOrder: idx + 1,
            isActive: true
          }))
        }
      },
      include: { subCategories: true }
    });

    categoryMap[createdCat.slug] = createdCat;
    for (const sub of createdCat.subCategories) {
      subCategoryMap[sub.slug] = sub;
    }
  }

  console.log('Categories and subcategories seeded.');

  // 4. Create Service Providers with Profiles, Documents, Availability & Listings
  const providersData = [
    {
      email: 'ramesh.plumber@gmail.com',
      name: 'Ramesh Kumar',
      phone: '+91 98451 22334',
      businessName: 'Ramesh Express Plumbing & Sanitary Solutions',
      experienceYears: 8,
      serviceArea: 'Palm Heights, Bellandur, Haralur & Green Glen',
      bio: 'Master certified plumber with 8+ years experience in high-rise plumbing, Jaquar/Kohler sanitary fittings, pressure pump diagnosis and concealed line leak repairs.',
      rating: 4.9,
      reviewCount: 38,
      completedJobsCount: 142,
      startingPrice: 299,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Aadhaar verified. Police clearance certificate verified by society security on Jan 2026.',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'plumber',
      title: 'Expert High-Rise Plumbing & Leakage Repair',
      desc: 'Complete sanitary diagnostics, tap spindle change, wall mixer fixes, kitchen sink trap cleaning, flushing cistern repair and concealed pipe leak detection with electronic sensors.',
      priceType: 'STARTING_PRICE',
      price: 299,
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'suresh.electrician@gmail.com',
      name: 'Suresh Varma',
      phone: '+91 98452 33445',
      businessName: 'Sparkle Electrical Works & Home Safety',
      experienceYears: 6,
      serviceArea: 'Palm Heights Campus & Bellandur Lake Rd',
      bio: 'Licensed wireman specializing in residential three-phase distribution, MCB trip troubleshooting, BLDC ceiling fan installations, warm-white LED architectural strips and inverter cabling.',
      rating: 4.8,
      reviewCount: 29,
      completedJobsCount: 98,
      startingPrice: 249,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Wireman license and government ID verified.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'electrician',
      title: 'Fast Electrical Repairs & BLDC Fan Installation',
      desc: 'Expert switchboard wiring, heavy appliance MCB replacement, chandelier hanging, smart switch installation and short-circuit diagnosis with multimeter.',
      priceType: 'STARTING_PRICE',
      price: 249,
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1558370781-d6196949e317?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'anita.cleaning@gmail.com',
      name: 'Anita Devi',
      phone: '+91 98453 44556',
      businessName: 'CleanHome Deep Cleaners & Sofa Spa',
      experienceYears: 5,
      serviceArea: 'Exclusive to Palm Heights Community',
      bio: 'Trained professional cleaning supervisor providing spotless apartment deep cleans, balcony scrubbing, fabric sofa vacuum extraction and anti-microbial disinfection.',
      rating: 4.9,
      reviewCount: 44,
      completedJobsCount: 115,
      startingPrice: 499,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Background checked with local police clearance on record.',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'cleaning-housekeeping',
      subCategorySlug: 'deep-cleaning',
      title: 'Full Apartment Deep Scrubbing & Sofa Shampooing',
      desc: 'Intensive tile descaling, stainless steel polish, greasy chimney filter degreasing, glass balcony wipe down and deep carpet vacuuming with non-toxic solutions.',
      priceType: 'STARTING_PRICE',
      price: 499,
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'rajesh.carwash@gmail.com',
      name: 'Rajesh Singh',
      phone: '+91 98454 55667',
      businessName: 'Shine Doorstep Basement Car Spa',
      experienceYears: 4,
      serviceArea: 'Palm Heights Basements B1 & B2',
      bio: 'Eco-friendly waterless and minimal-water doorstep vehicle care specialist. Daily morning slot car wiping, monthly foam wash and tire gloss in your allocated parking bay.',
      rating: 4.7,
      reviewCount: 22,
      completedJobsCount: 85,
      startingPrice: 350,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Basement entry pass cleared by Palm Heights Security.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'vehicle',
      subCategorySlug: 'car-washing',
      title: 'Basement Doorstep Foam Wash & Interior Vacuum',
      desc: 'Microfiber dual-bucket wash, wheel rim de-ironing, windshield rain repellent treatment and interior floor mat vacuuming directly at your basement parking slot.',
      priceType: 'PER_VISIT',
      price: 350,
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'meena.cook@gmail.com',
      name: 'Meena Subramaniam',
      phone: '+91 98455 66778',
      businessName: 'Homely Kitchen Delights',
      experienceYears: 10,
      serviceArea: 'Towers A, B, C & D',
      bio: 'Experienced South and North Indian cook with 10 years experience serving families in gated societies. Clean, hygienic, punctual, and experts in healthy oil-controlled preparations.',
      rating: 5.0,
      reviewCount: 19,
      completedJobsCount: 48,
      startingPrice: 5000,
      availableToday: false,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Medical fitness test and society ID verified.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'household-personal',
      subCategorySlug: 'cook',
      title: 'Daily Home Cook for North & South Indian Meals',
      desc: 'Breakfast, lunch and dinner meal prep for family of 3-5. Roti making, sabzis, dal tadka, sambar, rasam, curd rice and weekend special dishes.',
      priceType: 'FIXED',
      price: 6500,
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'vijay.tutor@gmail.com',
      name: 'Vijay Krishna (M.Sc)',
      phone: '+91 98456 77889',
      businessName: 'Apex Math & Physics Mentorship',
      experienceYears: 7,
      serviceArea: 'Palm Heights In-Person & Hybrid',
      bio: 'Former FIITJEE faculty member teaching ICSE/CBSE Mathematics and Physics for grades 8 to 12. Focus on conceptual clarity, Olympiad preparation and board exam confidence.',
      rating: 4.9,
      reviewCount: 16,
      completedJobsCount: 62,
      startingPrice: 600,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'Educational degrees verified. Society resident reference verified.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'education-skills',
      subCategorySlug: 'home-tuition',
      title: 'Class 8-12 Math & Physics Conceptual Tuition',
      desc: 'Small batch (max 3 students) or 1-on-1 tutoring. Weekly chapter tests, board question bank solving and doubts cleared with real-life visual analogies.',
      priceType: 'HOURLY',
      price: 750,
      beforeAfterPhotos: []
    },
    {
      email: 'kavita.ca@gmail.com',
      name: 'Kavita Rao, FCA',
      phone: '+91 98457 88990',
      businessName: 'Apex Tax & NRI Asset Advisory',
      experienceYears: 9,
      serviceArea: 'Palm Heights Residents & Pan-India',
      bio: 'Fellow Chartered Accountant assisting salaried IT executives, NRI property owners and startup founders with ITR-2/3/4 filings, capital gains tax optimization and foreign stock compliance (ESOP/RSU).',
      rating: 5.0,
      reviewCount: 27,
      completedJobsCount: 75,
      startingPrice: 999,
      availableToday: true,
      isApproved: true,
      verificationStatus: 'APPROVED',
      approvalNotes: 'ICAI Membership No. 248911 verified.',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'professional',
      subCategorySlug: 'ca-tax-gst',
      title: 'ITR-2/3 Filing, Capital Gains & RSU Tax Consultation',
      desc: 'Complete audit review of Form 26AS, AIS/TIS reconciliation, foreign equity income disclosure and advance tax computation with legal confidentiality.',
      priceType: 'FIXED',
      price: 1999,
      beforeAfterPhotos: []
    },
    {
      // Pending approval provider for testing admin queue
      email: 'sunil.carpenter@gmail.com',
      name: 'Sunil Sharma',
      phone: '+91 98458 99001',
      businessName: 'WoodCraft Modular Furniture Works',
      experienceYears: 5,
      serviceArea: 'Palm Heights & Surrounding Areas',
      bio: 'Experienced wood craftsman offering hydraulic hinge replacements, drawer realignment, custom shoe racks and balcony woodwork.',
      rating: 5.0,
      reviewCount: 0,
      completedJobsCount: 0,
      startingPrice: 350,
      availableToday: true,
      isApproved: false,
      verificationStatus: 'PENDING',
      approvalNotes: 'Awaiting admin document inspection.',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'carpenter',
      title: 'Precision Modular Furniture & Hinge Repairs',
      desc: 'Fix squeaky hinges, realign soft-close drawers, install childproof latches, and repair dining chair frames.',
      priceType: 'STARTING_PRICE',
      price: 350,
      beforeAfterPhotos: []
    }
  ];

  const createdProviders = [];

  for (const prov of providersData) {
    const user = await prisma.user.create({
      data: {
        email: prov.email,
        passwordHash,
        name: prov.name,
        phone: prov.phone,
        role: 'PROVIDER',
        isVerified: prov.isApproved,
        status: 'ACTIVE',
        communityId: community.id,
        avatar: prov.avatar,
        providerProfile: {
          create: {
            businessName: prov.businessName,
            experienceYears: prov.experienceYears,
            serviceArea: prov.serviceArea,
            bio: prov.bio,
            rating: prov.rating,
            reviewCount: prov.reviewCount,
            completedJobsCount: prov.completedJobsCount,
            startingPrice: prov.startingPrice,
            availableToday: prov.availableToday,
            isApproved: prov.isApproved,
            verificationStatus: prov.verificationStatus,
            approvalNotes: prov.approvalNotes,
            idProofType: 'AADHAAR',
            idProofUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
            policeVerificationUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=500&q=80',
            beforeAfterPhotos: JSON.stringify(prov.beforeAfterPhotos)
          }
        }
      },
      include: { providerProfile: true }
    });

    createdProviders.push({ user, prov });

    const pProfile = user.providerProfile;

    // Add sample verification documents
    await prisma.providerDocument.createMany({
      data: [
        {
          providerProfileId: pProfile.id,
          docType: 'ID_PROOF',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80',
          fileName: 'Govt_Aadhaar_Card_Verified.pdf',
          status: prov.isApproved ? 'APPROVED' : 'PENDING'
        },
        {
          providerProfileId: pProfile.id,
          docType: 'POLICE_VERIFICATION',
          fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=500&q=80',
          fileName: 'Karnataka_Police_Clearance_2026.pdf',
          status: prov.isApproved ? 'APPROVED' : 'PENDING'
        }
      ]
    });

    // Add Service Availability (Monday through Saturday, 9 AM - 7 PM)
    for (let day = 1; day <= 6; day++) {
      await prisma.serviceAvailability.create({
        data: {
          providerProfileId: pProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          isAvailable: true
        }
      });
    }

    // Add Service Listing
    const category = categoryMap[prov.categorySlug];
    const subCategory = subCategoryMap[prov.subCategorySlug];

    if (category) {
      await prisma.serviceListing.create({
        data: {
          providerProfileId: pProfile.id,
          categoryId: category.id,
          subCategoryId: subCategory ? subCategory.id : null,
          title: prov.title,
          description: prov.desc,
          priceType: prov.priceType,
          price: prov.price,
          visibility: 'APARTMENT_ONLY',
          status: prov.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL',
          approvalNotes: prov.isApproved ? 'Approved by Admin Vikramaditya Rao' : null,
          photosJson: JSON.stringify(prov.beforeAfterPhotos)
        }
      });
    }
  }

  console.log('Providers, listings, documents & availability seeded.');

  // 5. Seed Real Service Requests with full lifecycle
  const ramesh = createdProviders.find(p => p.prov.email === 'ramesh.plumber@gmail.com');
  const suresh = createdProviders.find(p => p.prov.email === 'suresh.electrician@gmail.com');
  const anita = createdProviders.find(p => p.prov.email === 'anita.cleaning@gmail.com');

  // Request 1: Completed & Reviewed
  const req1 = await prisma.serviceRequest.create({
    data: {
      requestNumber: 'REQ-2026-0041',
      residentId: resident1.id,
      providerProfileId: ramesh.user.providerProfile.id,
      categoryName: 'Home Maintenance',
      subCategoryName: 'Plumber',
      preferredDate: '2026-11-01',
      preferredTimeSlot: '10:00 AM - 12:00 PM',
      block: 'Tower B',
      flatNumber: '304',
      problemDescription: 'Water leakage in master bathroom washbasin bottle trap. Slow dripping sound causing water accumulation.',
      status: 'REVIEWED',
      completionPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      completionNotes: 'Replaced cracked rubber washer in PVC bottle trap and applied silicone sealant. Pressure checked.'
    }
  });

  await prisma.requestStatusHistory.createMany({
    data: [
      { serviceRequestId: req1.id, fromStatus: null, toStatus: 'REQUESTED', note: 'Request initiated by resident Rahul Sharma', changedById: resident1.id },
      { serviceRequestId: req1.id, fromStatus: 'REQUESTED', toStatus: 'ACCEPTED', note: 'Accepted by Ramesh Express Plumbing', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'ACCEPTED', toStatus: 'VISIT_SCHEDULED', note: 'Visit scheduled for 10:30 AM Nov 01', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'VISIT_SCHEDULED', toStatus: 'IN_PROGRESS', note: 'Ramesh checked in with security gate pass', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', note: 'Job completed. Washer replaced.', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'COMPLETED', toStatus: 'REVIEWED', note: 'Resident posted 5-star review', changedById: resident1.id }
    ]
  });

  // Create Review adhering strictly to privacy rule: First Name + Block only!
  await prisma.review.create({
    data: {
      serviceRequestId: req1.id,
      residentId: resident1.id,
      providerProfileId: ramesh.user.providerProfile.id,
      rating: 5,
      comment: 'Ramesh came on time, identified the faulty washer in 2 minutes, and replaced it cleanly without making any mess. Highly recommended for any tower resident!',
      reviewerFirstName: 'Rahul',
      reviewerBlock: 'Tower B',
      photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
    }
  });

  // Request 2: In Progress
  const req2 = await prisma.serviceRequest.create({
    data: {
      requestNumber: 'REQ-2026-0042',
      residentId: resident2.id,
      providerProfileId: suresh.user.providerProfile.id,
      categoryName: 'Home Maintenance',
      subCategoryName: 'Electrician',
      preferredDate: '2026-11-02',
      preferredTimeSlot: '02:00 PM - 04:00 PM',
      block: 'Tower A',
      flatNumber: '1202',
      problemDescription: 'Living room BLDC fan speed regulator making buzzing noise, and dining table light switch is loose.',
      status: 'IN_PROGRESS'
    }
  });

  await prisma.requestStatusHistory.createMany({
    data: [
      { serviceRequestId: req2.id, fromStatus: null, toStatus: 'REQUESTED', note: 'Request placed by resident Priya Patel', changedById: resident2.id },
      { serviceRequestId: req2.id, fromStatus: 'REQUESTED', toStatus: 'ACCEPTED', note: 'Suresh Varma accepted the job', changedById: suresh.user.id },
      { serviceRequestId: req2.id, fromStatus: 'ACCEPTED', toStatus: 'VISIT_SCHEDULED', note: 'Visit confirmed for 2:30 PM today', changedById: suresh.user.id },
      { serviceRequestId: req2.id, fromStatus: 'VISIT_SCHEDULED', toStatus: 'IN_PROGRESS', note: 'Provider arrived at Tower A 1202', changedById: suresh.user.id }
    ]
  });

  // Request 3: Pending / Requested for Anita Deep Cleaning
  const req3 = await prisma.serviceRequest.create({
    data: {
      requestNumber: 'REQ-2026-0043',
      residentId: resident1.id,
      providerProfileId: anita.user.providerProfile.id,
      categoryName: 'Cleaning & Housekeeping',
      subCategoryName: 'Deep Cleaning',
      preferredDate: '2026-11-04',
      preferredTimeSlot: '09:00 AM - 01:00 PM',
      block: 'Tower B',
      flatNumber: '304',
      problemDescription: 'Balcony deep tile scrubbing and kitchen chimney mesh cleaning before upcoming family festival gathering.',
      status: 'REQUESTED'
    }
  });

  await prisma.requestStatusHistory.create({
    data: {
      serviceRequestId: req3.id,
      fromStatus: null,
      toStatus: 'REQUESTED',
      note: 'New request awaiting provider response',
      changedById: resident1.id
    }
  });

  console.log('Service requests, history & privacy reviews seeded.');

  // 6. FEATURE 5: REQUIREMENTS (Completely independent from Services!)
  const reqmt1 = await prisma.requirement.create({
    data: {
      requirementNumber: 'REQMT-2026-0001',
      residentId: resident1.id,
      communityId: community.id,
      category: 'COOK',
      roleTitle: 'Experienced Home Cook for Family of 4 (Morning & Evening)',
      scheduleType: 'PART_TIME',
      duration: 'LONG_TERM',
      payRangeMin: 7000,
      payRangeMax: 9000,
      payPeriod: 'MONTHLY',
      description: 'Looking for a reliable cook for Tower B 304. Preparation of morning breakfast (idli/dosa/poha) and evening dinner (rotis, dal, 2 vegetable curries). Hygiene and punctuality are top priorities.',
      preferredStartTime: '07:30 AM & 06:30 PM',
      status: 'OPEN',
      applicantCount: 2
    }
  });

  const reqmt2 = await prisma.requirement.create({
    data: {
      requirementNumber: 'REQMT-2026-0002',
      residentId: resident2.id,
      communityId: community.id,
      category: 'DRIVER',
      roleTitle: 'Part-Time Chauffeur for Automatic Sedan (Morning School & Office Drop)',
      scheduleType: 'PART_TIME',
      duration: 'LONG_TERM',
      payRangeMin: 10000,
      payRangeMax: 12500,
      payPeriod: 'MONTHLY',
      description: 'Need an experienced, non-smoking driver for morning routine: 8:00 AM school drop in Sarjapur Road and 9:15 AM office drop at Ecospace Bellandur. Valid DL and local address proof required.',
      preferredStartTime: '08:00 AM - 11:30 AM',
      status: 'OPEN',
      applicantCount: 1
    }
  });

  const reqmt3 = await prisma.requirement.create({
    data: {
      requirementNumber: 'REQMT-2026-0003',
      residentId: resident1.id,
      communityId: community.id,
      category: 'HOUSEKEEPING',
      roleTitle: 'Daily Morning Housekeeping & Utensil Washing Assistant',
      scheduleType: 'PART_TIME',
      duration: 'LONG_TERM',
      payRangeMin: 4000,
      payRangeMax: 5000,
      payPeriod: 'MONTHLY',
      description: 'Daily 1.5 hours: floor sweeping and wet mopping of 3BHK flat, utensil cleaning and drying, balcony dusting.',
      preferredStartTime: '08:30 AM',
      status: 'OPEN',
      applicantCount: 0
    }
  });

  // Seed Requirement Applications
  await prisma.requirementApplication.createMany({
    data: [
      {
        requirementId: reqmt1.id,
        applicantId: ramesh.user.id,
        applicantRole: 'RECOMMENDER',
        coverNote: 'My cousin sister Lakshmi has been cooking for 3 flats in Tower C for past 3 years. Very clean and punctual.',
        expectedPay: 8000,
        experience: '6 years in residential apartments',
        status: 'SHORTLISTED'
      },
      {
        requirementId: reqmt1.id,
        applicantId: anita.user.id,
        applicantRole: 'APPLICANT',
        coverNote: 'I have an experienced domestic partner who specializes in Gujarati and North Indian cuisine.',
        expectedPay: 8500,
        experience: '8 years cooking experience',
        status: 'PENDING'
      },
      {
        requirementId: reqmt2.id,
        applicantId: suresh.user.id,
        applicantRole: 'APPLICANT',
        coverNote: 'I hold 12 years commercial badge driving license with clean record. Available in morning slot.',
        expectedPay: 11000,
        experience: '12 years driving luxury sedans & SUVs',
        status: 'PENDING'
      }
    ]
  });

  console.log('Feature 5: Requirements and applications seeded.');

  // 7. Seed In-App Conversations & Messages (Preserving Phone Privacy)
  const conv1 = await prisma.conversation.create({
    data: {
      residentId: resident1.id,
      providerId: ramesh.user.id,
      serviceRequestId: req1.id,
      lastMessageText: 'Glad everything is working smoothly now Rahul ji. Let me know if you ever need plumbing checkups.',
      lastMessageAt: new Date()
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: resident1.id,
        content: 'Hi Ramesh, the master bathroom washbasin bottle trap is leaking. Can you carry an extra 32mm rubber washer and PVC joint?',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 24)
      },
      {
        conversationId: conv1.id,
        senderId: ramesh.user.id,
        content: 'Namaste Rahul ji. Yes, I carry Jaquar and standard PVC spares in my toolkit. I will reach Tower B at 10:20 AM after my gate entry.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 23)
      },
      {
        conversationId: conv1.id,
        senderId: ramesh.user.id,
        content: 'Glad everything is working smoothly now Rahul ji. Let me know if you ever need plumbing checkups.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 2)
      }
    ]
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: resident1.id,
        type: 'REQUEST_STATUS_CHANGE',
        title: 'Service Completed',
        message: 'Ramesh Kumar marked REQ-2026-0041 as completed. Tap here to rate and leave a review.',
        link: '/requests',
        isRead: true
      },
      {
        userId: resident2.id,
        type: 'REQUEST_STATUS_CHANGE',
        title: 'Technician Arrived',
        message: 'Suresh Varma checked into Tower A for your electrical service REQ-2026-0042.',
        link: '/requests',
        isRead: false
      },
      {
        userId: ramesh.user.id,
        type: 'REVIEW_RECEIVED',
        title: 'New 5-Star Review Received!',
        message: 'Rahul from Tower B gave you 5 stars: "Ramesh came on time, identified the faulty washer in 2 minutes..."',
        link: '/provider/dashboard',
        isRead: false
      },
      {
        userId: adminUser.id,
        type: 'PROVIDER_APPROVAL',
        title: 'New Provider Pending Verification',
        message: 'Sunil Sharma submitted profile and Aadhaar card for WoodCraft Furniture.',
        link: '/admin/approvals',
        isRead: false
      }
    ]
  });

  // 9. Notification Preferences
  for (const u of [adminUser, managerUser, resident1, resident2, ramesh.user, suresh.user]) {
    await prisma.notificationPreference.create({
      data: {
        userId: u.id,
        pushEnabled: true,
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true
      }
    });
  }

  // 10. Sample Reports & Moderation
  await prisma.report.create({
    data: {
      reporterId: resident2.id,
      targetType: 'PROVIDER',
      targetId: createdProviders[createdProviders.length - 1].user.id,
      reason: 'DUPLICATE_LISTING',
      notes: 'Testing moderation queue: Checking if multiple phone listings are prevented by society guidelines.',
      status: 'PENDING'
    }
  });

  console.log('Database seeding complete! All roles, categories, services, requirements & requests created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
