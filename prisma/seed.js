const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Enterprise Apartment Management & Marketplace database...');

  // Clean existing data in reverse relational order
  await prisma.visitAuditLog.deleteMany();
  await prisma.providerVisit.deleteMany();
  await prisma.apartmentGate.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.businessCampaign.deleteMany();
  await prisma.localBusiness.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.providerServiceArea.deleteMany();
  await prisma.residentInvitation.deleteMany();
  await prisma.residentApplication.deleteMany();
  await prisma.apartmentUnit.deleteMany();
  await prisma.apartmentBlock.deleteMany();
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

  // 1. Create Multiple Apartment Communities
  const community1 = await prisma.community.create({
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
      status: 'ACTIVE',
      onboardingMode: 'BOTH',
      contactPerson: 'Sunita Deshmukh',
      contactPhone: '+91 98450 11002',
      contactEmail: 'manager@palmheights.com',
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

  const community2 = await prisma.community.create({
    data: {
      name: 'Green Glen Elite Enclave',
      code: 'GGEE-BLR-02',
      address: 'Green Glen Layout, Bellandur Lake Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      totalBlocks: 2,
      totalFlats: 160,
      heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
      status: 'ACTIVE',
      onboardingMode: 'BOTH',
      contactPerson: 'Kishore Nambiar',
      contactPhone: '+91 98450 11099',
      contactEmail: 'admin@greenglen.org'
    }
  });

  const community3 = await prisma.community.create({
    data: {
      name: 'Silver Oak Residences',
      code: 'SILVER-HSR-03',
      address: '27th Main, Sector 1, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      totalBlocks: 3,
      totalFlats: 210,
      heroImage: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1600&q=80',
      status: 'ACTIVE',
      onboardingMode: 'BOTH',
      contactPerson: 'Meera Sen',
      contactPhone: '+91 98450 11098',
      contactEmail: 'estate@silveroak.in'
    }
  });

  console.log('Multiple communities created:', community1.name, community2.name, community3.name);

  // 2. Create Blocks and Units for Palm Heights
  const blocksData = [
    { name: 'Tower A', code: 'TOW-A', totalFloors: 14 },
    { name: 'Tower B', code: 'TOW-B', totalFloors: 14 },
    { name: 'Tower C', code: 'TOW-C', totalFloors: 14 },
    { name: 'Tower D', code: 'TOW-D', totalFloors: 14 },
  ];

  const createdBlocks = [];
  for (const b of blocksData) {
    const blk = await prisma.apartmentBlock.create({
      data: {
        communityId: community1.id,
        name: b.name,
        code: b.code,
        totalFloors: b.totalFloors
      }
    });
    createdBlocks.push(blk);

    // Seed sample units
    const unitNumbers = ['101', '102', '201', '202', '304', '402', '1202'];
    for (const uNum of unitNumbers) {
      await prisma.apartmentUnit.create({
        data: {
          blockId: blk.id,
          floorNumber: parseInt(uNum[0], 10) || 1,
          unitNumber: uNum,
          residentType: uNum === '402' ? 'VACANT' : 'OWNER',
          status: uNum === '402' ? 'VACANT' : 'OCCUPIED'
        }
      });
    }
  }

  // 3. Create Security Gates for QR Attendance
  const gateA = await prisma.apartmentGate.create({
    data: {
      communityId: community1.id,
      gateName: 'Main Security Gate A',
      gateCode: 'GATE-PALM-01',
      qrSecret: 'secret_palm_gate_a_2026',
      isActive: true
    }
  });

  const gateB = await prisma.apartmentGate.create({
    data: {
      communityId: community1.id,
      gateName: 'North Service & Delivery Gate',
      gateCode: 'GATE-PALM-02',
      qrSecret: 'secret_palm_gate_b_2026',
      isActive: true
    }
  });

  console.log('Blocks, units, and security gates created.');

  // 4. Create Users across 5 Roles
  // Role 5: Platform Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@palmheights.com',
      passwordHash,
      name: 'Vikramaditya Rao',
      phone: '+919845011001',
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    }
  });

  // Role 2: Society Management
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@palmheights.com',
      passwordHash,
      name: 'Sunita Deshmukh',
      phone: '+919845011002',
      role: 'MANAGEMENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
    }
  });

  // Connect manager to community1
  await prisma.community.update({
    where: { id: community1.id },
    data: { managerId: managerUser.id }
  });

  // Role 1: Apartment Residents
  const resident1 = await prisma.user.create({
    data: {
      email: 'rahul.sharma@gmail.com',
      passwordHash,
      name: 'Rahul Sharma',
      phone: '+919886033441',
      role: 'RESIDENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      residentProfile: {
        create: {
          alternatePhone: '+919886033442',
          familyMembersCount: 4,
          intercomNumber: '2304',
          bio: 'Tech lead living in Tower B with family. Avid badminton player.'
        }
      },
      communityMembers: {
        create: {
          communityId: community1.id,
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
      phone: '+919740055662',
      role: 'RESIDENT',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      residentProfile: {
        create: {
          alternatePhone: '+919740055663',
          familyMembersCount: 3,
          intercomNumber: '11202',
          bio: 'Product designer in Tower A. Plant parent & baker.'
        }
      },
      communityMembers: {
        create: {
          communityId: community1.id,
          block: 'Tower A',
          flatNumber: '1202',
          residentType: 'OWNER',
          isVerified: true
        }
      }
    }
  });

  // Resident pending approval (self-registration)
  const pendingResidentUser = await prisma.user.create({
    data: {
      email: 'anand.kulkarni@gmail.com',
      passwordHash,
      name: 'Anand Kulkarni',
      phone: '+919845099887',
      role: 'RESIDENT',
      isVerified: false,
      status: 'PENDING',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
    }
  });

  await prisma.residentApplication.create({
    data: {
      communityId: community1.id,
      userId: pendingResidentUser.id,
      block: 'Tower C',
      flatNumber: '402',
      residentType: 'TENANT',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      status: 'PENDING'
    }
  });

  // Role 6: Authenticated Guest User (Requirement 11)
  const guestUser = await prisma.user.create({
    data: {
      email: 'guest.demo@palmheights.com',
      passwordHash,
      name: 'Kavita Nair',
      phone: '+919845012345',
      role: 'GUEST',
      isVerified: true,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
    }
  });

  // Seed sample upgrade application for guestUser
  await prisma.roleUpgradeApplication.create({
    data: {
      userId: guestUser.id,
      targetRole: 'PROVIDER',
      status: 'PENDING_REVIEW',
      applicationDataJson: JSON.stringify({
        businessName: 'Kavita Home Baking & Confectionery',
        serviceCategory: 'cleaning-housekeeping',
        experienceYears: '4',
        startingPrice: '399',
        serviceArea: 'Palm Heights, Bellandur',
        bio: 'Artisan home baker and cake decorator specializing in customized birthday cakes and sourdough breads.',
        idProofType: 'AADHAAR',
        idProofUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
      })
    }
  });

  // Role 4: Local Businesses
  const businessUser1 = await prisma.user.create({
    data: {
      email: 'owner@namastefresh.com',
      passwordHash,
      name: 'Rohan Singhal',
      phone: '+919845077112',
      role: 'BUSINESS',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
    }
  });

  const business1 = await prisma.localBusiness.create({
    data: {
      userId: businessUser1.id,
      businessName: 'Namaste Fresh Supermarket & Organics',
      registrationNumber: 'GSTIN29AABCS1429B1Z8',
      category: 'GROCERY',
      description: 'Neighborhood supermarket offering hydroponic vegetables, dairy, pulses, farm eggs, and doorstep delivery within 30 minutes.',
      logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
      address: 'Shop 12-14, Green Glen Commercial Complex, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      contactPhone: '+919845077112',
      contactEmail: 'orders@namastefresh.com',
      website: 'https://namastefresh.local',
      operatingAreasJson: JSON.stringify(['Bellandur', 'HSR Layout', 'Outer Ring Road', 'Haralur']),
      targetApartments: JSON.stringify([community1.id, community2.id]),
      isApproved: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE',
      tier: 'GOLD',
      tierStatus: 'ACTIVE',
      tierEffectiveDate: new Date()
    }
  });

  const businessUser2 = await prisma.user.create({
    data: {
      email: 'care@apollolocal.com',
      passwordHash,
      name: 'Dr. Shalini Hegde',
      phone: '+919845077223',
      role: 'BUSINESS',
      isVerified: true,
      status: 'ACTIVE',
      communityId: community1.id,
      avatar: 'https://images.unsplash.com/photo-1594824813511-20700889c47e?auto=format&fit=crop&w=250&q=80'
    }
  });

  const business2 = await prisma.localBusiness.create({
    data: {
      userId: businessUser2.id,
      businessName: 'Apollo 24x7 Neighborhood Pharmacy',
      registrationNumber: 'KA-DRUG-LIC-89412',
      category: 'PHARMACY',
      description: 'Licensed community pharmacy offering prescription medications, baby wellness essentials, pulse oximeters, and doorstep cold-chain delivery.',
      logoUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
      address: 'Ground Floor, Bellandur Lake Road, Opp. Palm Heights Gate 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      contactPhone: '+919845077223',
      contactEmail: 'care@apollolocal.com',
      website: 'https://apollopharmacy.in',
      operatingAreasJson: JSON.stringify(['Bellandur', 'Outer Ring Road']),
      targetApartments: JSON.stringify([community1.id]),
      isApproved: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE',
      tier: 'SILVER',
      tierStatus: 'ACTIVE',
      tierEffectiveDate: new Date()
    }
  });

  console.log('Businesses created:', business1.businessName, business2.businessName);

  // 5. Create Service Categories & Subcategories
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

  // 6. Create Service Providers with Profiles, Geographic Coverage & Subscriptions
  const providersData = [
    {
      email: 'ramesh.plumber@gmail.com',
      name: 'Ramesh Kumar',
      phone: '+919845122334',
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
      tier: 'GOLD',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'plumber',
      title: 'Expert High-Rise Plumbing & Leakage Repair',
      desc: 'Complete sanitary diagnostics, tap spindle change, wall mixer fixes, kitchen sink trap cleaning, flushing cistern repair and concealed pipe leak detection with electronic sensors.',
      priceType: 'STARTING_PRICE',
      price: 299,
      localities: [
        { locality: 'Bellandur', postalCode: '560103', radius: 5.0 },
        { locality: 'HSR Layout', postalCode: '560102', radius: 6.0 },
        { locality: 'Electronic City', postalCode: '560100', radius: 8.0 }
      ],
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'suresh.electrician@gmail.com',
      name: 'Suresh Varma',
      phone: '+919845233445',
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
      tier: 'SILVER',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'electrician',
      title: 'Fast Electrical Repairs & BLDC Fan Installation',
      desc: 'Expert switchboard wiring, heavy appliance MCB replacement, chandelier hanging, smart switch installation and short-circuit diagnosis with multimeter.',
      priceType: 'STARTING_PRICE',
      price: 249,
      localities: [
        { locality: 'Bellandur', postalCode: '560103', radius: 4.0 },
        { locality: 'Green Glen Layout', postalCode: '560103', radius: 3.0 }
      ],
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1558370781-d6196949e317?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'anita.cleaning@gmail.com',
      name: 'Anita Devi',
      phone: '+919845344556',
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
      tier: 'BRONZE',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'cleaning-housekeeping',
      subCategorySlug: 'deep-cleaning',
      title: 'Full Apartment Deep Scrubbing & Sofa Shampooing',
      desc: 'Intensive tile descaling, stainless steel polish, greasy chimney filter degreasing, glass balcony wipe down and deep carpet vacuuming with non-toxic solutions.',
      priceType: 'STARTING_PRICE',
      price: 499,
      localities: [
        { locality: 'Bellandur', postalCode: '560103', radius: 3.0 }
      ],
      beforeAfterPhotos: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      email: 'sunil.carpenter@gmail.com',
      name: 'Sunil Sharma',
      phone: '+919845899001',
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
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
      categorySlug: 'home-maintenance',
      subCategorySlug: 'carpenter',
      title: 'Precision Modular Furniture & Hinge Repairs',
      desc: 'Fix squeaky hinges, realign soft-close drawers, install childproof latches, and repair dining chair frames.',
      priceType: 'STARTING_PRICE',
      price: 350,
      localities: [
        { locality: 'Bellandur', postalCode: '560103', radius: 5.0 }
      ],
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
        communityId: community1.id,
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
            tier: prov.tier || 'BRONZE',
            tierStatus: 'ACTIVE',
            tierEffectiveDate: new Date(),
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

    // Create Service Areas
    for (const loc of prov.localities) {
      await prisma.providerServiceArea.create({
        data: {
          providerProfileId: pProfile.id,
          country: 'India',
          state: 'Karnataka',
          city: 'Bengaluru',
          locality: loc.locality,
          postalCode: loc.postalCode,
          serviceRadiusKm: loc.radius,
          communityId: community1.id
        }
      });
    }

    // Availability Monday - Saturday
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

    // Listing
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
          photosJson: JSON.stringify(prov.beforeAfterPhotos)
        }
      });
    }
  }

  // 7. Seed Monetization: Subscription Plans, Subscriptions & Transactions
  const planProviderFree = await prisma.subscriptionPlan.create({
    data: {
      name: 'Provider Starter',
      targetRole: 'PROVIDER',
      planType: 'FREE',
      priceInr: 0,
      billingCycle: 'MONTHLY',
      description: 'Free basic registration, standard listing in 1 apartment community, standard lead notifications.',
      featureEntitlementsJson: JSON.stringify({ maxApartments: 1, priorityBadge: false, leadCommissionPercent: 0 }),
      isActive: true,
      sortOrder: 1
    }
  });

  const planProviderPaid = await prisma.subscriptionPlan.create({
    data: {
      name: 'Provider Pro Gold',
      targetRole: 'PROVIDER',
      planType: 'PAID',
      priceInr: 499,
      billingCycle: 'MONTHLY',
      description: 'Enhanced visibility badge, coverage in up to 5 apartment communities, priority leads, instant SMS dispatch.',
      featureEntitlementsJson: JSON.stringify({ maxApartments: 5, priorityBadge: true, instantSms: true }),
      isActive: true,
      sortOrder: 2
    }
  });

  const planBusinessFree = await prisma.subscriptionPlan.create({
    data: {
      name: 'Business Directory Free',
      targetRole: 'LOCAL_BUSINESS',
      planType: 'FREE',
      priceInr: 0,
      billingCycle: 'MONTHLY',
      description: 'Basic business directory listing, contact details, 1 targeted society.',
      featureEntitlementsJson: JSON.stringify({ maxActiveCampaigns: 0, targetSocieties: 1 }),
      isActive: true,
      sortOrder: 3
    }
  });

  const planBusinessPaid = await prisma.subscriptionPlan.create({
    data: {
      name: 'Business Growth Prime',
      targetRole: 'LOCAL_BUSINESS',
      planType: 'PAID',
      priceInr: 1499,
      billingCycle: 'MONTHLY',
      description: 'Up to 3 active promotional banner campaigns, targeting across 5 communities, resident deal highlights, real-time analytics.',
      featureEntitlementsJson: JSON.stringify({ maxActiveCampaigns: 3, targetSocieties: 5, featuredDeals: true }),
      isActive: true,
      sortOrder: 4
    }
  });

  console.log('Subscription plans created.');

  // Create active subscription for Ramesh (Provider Pro)
  const ramesh = createdProviders.find(p => p.prov.email === 'ramesh.plumber@gmail.com');
  const suresh = createdProviders.find(p => p.prov.email === 'suresh.electrician@gmail.com');
  const anita = createdProviders.find(p => p.prov.email === 'anita.cleaning@gmail.com');

  const rameshSub = await prisma.subscription.create({
    data: {
      userId: ramesh.user.id,
      planId: planProviderPaid.id,
      targetRole: 'PROVIDER',
      status: 'ACTIVE',
      currentPeriodStart: new Date(Date.now() - 1000 * 3600 * 24 * 5),
      currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 25),
      autoRenew: true
    }
  });

  const txn1 = await prisma.paymentTransaction.create({
    data: {
      transactionNumber: 'TXN-2026-0001',
      userId: ramesh.user.id,
      subscriptionId: rameshSub.id,
      amountInr: 499,
      currency: 'INR',
      status: 'SUCCESS',
      paymentMethod: 'UPI',
      gatewayReference: 'pay_rzp_test_88194a',
      gatewaySignature: 'sig_verified_hash_992'
    }
  });

  // Create active subscription for Namaste Fresh (Business Growth Prime)
  const namasteSub = await prisma.subscription.create({
    data: {
      userId: businessUser1.id,
      planId: planBusinessPaid.id,
      targetRole: 'LOCAL_BUSINESS',
      status: 'ACTIVE',
      currentPeriodStart: new Date(Date.now() - 1000 * 3600 * 24 * 10),
      currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 20),
      autoRenew: true
    }
  });

  const txn2 = await prisma.paymentTransaction.create({
    data: {
      transactionNumber: 'TXN-2026-0002',
      userId: businessUser1.id,
      subscriptionId: namasteSub.id,
      amountInr: 1499,
      currency: 'INR',
      status: 'SUCCESS',
      paymentMethod: 'NETBANKING',
      gatewayReference: 'pay_rzp_test_99214b',
      gatewaySignature: 'sig_verified_hash_881'
    }
  });

  console.log('Subscriptions & transactions seeded:', txn1.transactionNumber, txn2.transactionNumber);

  // 8. Create Advertising Campaigns (Role 4 & Resident free view)
  const campaign1 = await prisma.businessCampaign.create({
    data: {
      businessId: business1.id,
      title: 'Fresh Organic Farm Harvest - 20% Off for Palm Heights',
      description: 'Hydroponic crisp spinach, vine-ripened tomatoes, and A2 Desi cow milk. Delivered directly to your tower lobby in 20 minutes.',
      bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      targetCategory: 'GROCERY',
      targetCity: 'Bengaluru',
      targetLocalitiesJson: JSON.stringify(['Bellandur', 'Outer Ring Road']),
      targetApartmentsJson: JSON.stringify([community1.id]),
      startDate: new Date(Date.now() - 1000 * 3600 * 24 * 2),
      endDate: new Date(Date.now() + 1000 * 3600 * 24 * 12),
      status: 'ACTIVE',
      impressionsCount: 248,
      clicksCount: 39,
      approvedById: adminUser.id,
      approvedAt: new Date(Date.now() - 1000 * 3600 * 24 * 2)
    }
  });

  const campaign2 = await prisma.businessCampaign.create({
    data: {
      businessId: business2.id,
      title: 'Free Essential Medicine Delivery & Health Checkup Voucher',
      description: 'Prescription medicines delivered to your doorstep within 30 minutes. Flat 15% off on baby care & wellness supplements.',
      bannerUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
      targetCategory: 'PHARMACY',
      targetCity: 'Bengaluru',
      targetLocalitiesJson: JSON.stringify(['Bellandur']),
      targetApartmentsJson: JSON.stringify([community1.id, community2.id]),
      startDate: new Date(Date.now() - 1000 * 3600 * 24 * 1),
      endDate: new Date(Date.now() + 1000 * 3600 * 24 * 14),
      status: 'ACTIVE',
      impressionsCount: 165,
      clicksCount: 22,
      approvedById: adminUser.id,
      approvedAt: new Date(Date.now() - 1000 * 3600 * 24 * 1)
    }
  });

  console.log('Advertising campaigns seeded:', campaign1.title);

  // 9. Create Real Service Requests with full QR Entry & Exit attendance
  // Request 1: Completed & Reviewed with recorded Entry and Exit
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
      { serviceRequestId: req1.id, fromStatus: 'VISIT_SCHEDULED', toStatus: 'IN_PROGRESS', note: 'Ramesh checked in via QR scanner at Gate A', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', note: 'Job completed. Washer replaced.', changedById: ramesh.user.id },
      { serviceRequestId: req1.id, fromStatus: 'COMPLETED', toStatus: 'REVIEWED', note: 'Resident posted 5-star review', changedById: resident1.id }
    ]
  });

  // Recorded QR Entry & Exit Visit for req1
  const entryDate1 = new Date(Date.now() - 1000 * 3600 * 48 + 1000 * 60 * 15);
  const exitDate1 = new Date(Date.now() - 1000 * 3600 * 48 + 1000 * 60 * 58);
  const visit1 = await prisma.providerVisit.create({
    data: {
      serviceRequestId: req1.id,
      providerProfileId: ramesh.user.providerProfile.id,
      communityId: community1.id,
      gateId: gateA.id,
      entryTimestamp: entryDate1,
      exitTimestamp: exitDate1,
      durationMinutes: 43,
      visitStatus: 'EXITED',
      entryQrToken: 'qr_token_entry_mock_req41',
      exitQrToken: 'qr_token_exit_mock_req41'
    }
  });

  await prisma.visitAuditLog.createMany({
    data: [
      { visitId: visit1.id, action: 'ENTRY_RECORDED', performedById: ramesh.user.id, reason: 'Valid QR scan at Main Security Gate A', timestamp: entryDate1 },
      { visitId: visit1.id, action: 'EXIT_RECORDED', performedById: ramesh.user.id, reason: 'Valid QR scan at Main Security Gate A upon departure', timestamp: exitDate1 }
    ]
  });

  // Review for req1
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

  // Request 2: In Progress - Currently Inside Apartment!
  const req2 = await prisma.serviceRequest.create({
    data: {
      requestNumber: 'REQ-2026-0042',
      residentId: resident2.id,
      providerProfileId: suresh.user.providerProfile.id,
      categoryName: 'Home Maintenance',
      subCategoryName: 'Electrician',
      preferredDate: '2026-11-03',
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
      { serviceRequestId: req2.id, fromStatus: 'VISIT_SCHEDULED', toStatus: 'IN_PROGRESS', note: 'Scanned QR Gate A at 2:28 PM. Entered campus.', changedById: suresh.user.id }
    ]
  });

  // Live Visit: Inside Apartment!
  const entryDate2 = new Date(Date.now() - 1000 * 60 * 35); // 35 minutes ago
  const visit2 = await prisma.providerVisit.create({
    data: {
      serviceRequestId: req2.id,
      providerProfileId: suresh.user.providerProfile.id,
      communityId: community1.id,
      gateId: gateA.id,
      entryTimestamp: entryDate2,
      visitStatus: 'INSIDE_APARTMENT',
      entryQrToken: 'qr_token_entry_suresh_req42'
    }
  });

  await prisma.visitAuditLog.create({
    data: {
      visitId: visit2.id,
      action: 'ENTRY_RECORDED',
      performedById: suresh.user.id,
      reason: 'Valid QR scan at Main Security Gate A',
      timestamp: entryDate2
    }
  });

  console.log('Provider visits and attendance seeded: 1 completed, 1 currently inside apartment.');

  // 10. FEATURE 5: Domestic Requirements (Hiring)
  const reqmt1 = await prisma.requirement.create({
    data: {
      requirementNumber: 'REQMT-2026-0001',
      residentId: resident1.id,
      communityId: community1.id,
      category: 'COOK',
      roleTitle: 'Experienced Home Cook for Family of 4 (Morning & Evening)',
      scheduleType: 'PART_TIME',
      duration: 'LONG_TERM',
      payRangeMin: 7000,
      payRangeMax: 9000,
      payPeriod: 'MONTHLY',
      description: 'Looking for a reliable cook for Tower B 304. Preparation of morning breakfast and evening dinner. Hygiene and punctuality are top priorities.',
      preferredStartTime: '07:30 AM & 06:30 PM',
      status: 'OPEN',
      applicantCount: 2
    }
  });

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
      }
    ]
  });

  // 11. Conversations and Private Messages (Zero phone leakage)
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
      }
    ]
  });

  // 12. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: resident1.id,
        type: 'SERVICE_REQUEST',
        title: 'Service Completed',
        message: 'Ramesh Kumar completed REQ-2026-0041. Review your experience.',
        link: '/requests',
        isRead: true
      },
      {
        userId: resident2.id,
        type: 'VISIT_UPDATE',
        title: 'Technician Entered Campus',
        message: 'Suresh Varma checked into Palm Heights Gate A at 2:28 PM for REQ-2026-0042.',
        link: '/requests',
        isRead: false
      },
      {
        userId: managerUser.id,
        type: 'VISIT_UPDATE',
        title: 'Technician on Campus',
        message: 'Suresh Varma (Sparkle Electrical) is currently inside Tower A for REQ-2026-0042.',
        link: '/management/attendance',
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

  // 13. Notification Preferences
  for (const u of [adminUser, managerUser, resident1, resident2, ramesh.user, suresh.user, businessUser1.user || businessUser1]) {
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

  console.log('Database seeding complete with all 5 roles, multi-apartments, local businesses, subscriptions, campaigns, and QR visits!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
