export const initialMockData = {
  users: [
    // Executive & Management
    { id: 1, name: 'Umar Muhammad Aminu', email: 'umar.aminu@archillery.com', password: 'password123', role: 'ceo', phone: '+2347066668877', status: 'active', employee_id: 'EMP-2026-0001', position: 'CEO / Executive Director', department: 'Executive Management', address: 'No 14 Maitama Ext, Abuja', emergency_contact: 'Mrs. Aminu (+234701234567)', salary: 1250000, leave_balance: 30, joined_date: '2024-01-10', photo: '/team-ceo.png', created_at: new Date() },
    { id: 2, name: 'Umar Sadiq Abubakar', email: 'umar.sadiq@archillery.com', password: 'password123', role: 'cto', phone: '+2348033334455', status: 'active', employee_id: 'EMP-2026-0002', position: 'CTO / Engineering Director', department: 'Engineering Ops', address: 'Plot 45 Wuse 2, Abuja', emergency_contact: 'Ahmed Sadiq (+234809988776)', salary: 950000, leave_balance: 24, joined_date: '2024-02-15', photo: '/team-cto.png', created_at: new Date() },
    { id: 3, name: 'Muazzam Ibrahim Zakariyya', email: 'muazzam.zakariyya@archillery.com', password: 'password123', role: 'hr', phone: '+2348055556677', status: 'active', employee_id: 'EMP-2026-0003', position: 'Human Resources Manager', department: 'Human Resources', address: 'Gwarimpa Sector C, Abuja', emergency_contact: 'Sani Ibrahim (+234805555444)', salary: 650000, leave_balance: 20, joined_date: '2024-06-01', photo: '/team-supervisor2.png', created_at: new Date() },
    { id: 4, name: 'Abubakar Sadiq Umar', email: 'abubakar.sadiq@archillery.com', password: 'password123', role: 'it', phone: '+2348066667788', status: 'active', employee_id: 'EMP-2026-0004', position: 'Head of IT / System Admin', department: 'Information Technology', address: 'Asokoro Villa Gate, Abuja', emergency_contact: 'Sadiq Umar (+234806666222)', salary: 700000, leave_balance: 20, joined_date: '2024-05-10', photo: '/team-it.png', created_at: new Date() },
    
    // Supervisors (Engineers & Project Managers)
    { id: 5, name: 'Musa Abubakar Dan-Baki', email: 'musa.danbaki@archillery.com', password: 'password123', role: 'supervisor', phone: '+2348077778899', status: 'active', employee_id: 'EMP-2026-0005', position: 'Senior Site Supervisor', department: 'Site Operations', address: 'Lokogoma Phase 2, Abuja', emergency_contact: 'Zainab Dan-Baki (+234807777111)', salary: 450000, leave_balance: 18, joined_date: '2024-09-01', photo: '/team-supervisor.png', created_at: new Date() },
    { id: 6, name: 'Muhammad Alamin Shuaibu', email: 'alamin.shuaibu@archillery.com', password: 'password123', role: 'engineer', phone: '+2348099990011', status: 'active', employee_id: 'EMP-2026-0006', position: 'Lead Site Engineer', department: 'Structural Engineering', address: 'Kado Estate Block B, Abuja', emergency_contact: 'Fatima Shuaibu (+234809999222)', salary: 500000, leave_balance: 18, joined_date: '2024-08-10', photo: '/team-engineer.png', created_at: new Date() },
    { id: 7, name: 'Muhammad Ayuba Aliyu', email: 'ayuba.aliyu@archillery.com', password: 'password123', role: 'supervisor', phone: '+2348011112233', status: 'active', employee_id: 'EMP-2026-0007', position: 'Site Supervisor II', department: 'Site Operations', address: 'Life Camp Marcon, Abuja', emergency_contact: 'Aliyu Ayuba (+234801111000)', salary: 400000, leave_balance: 18, joined_date: '2025-01-15', photo: '/team-pm.jpg', created_at: new Date() },
    { id: 8, name: 'Abdullahi Abubakar Danbaki', email: 'abdullahi.danbaki@archillery.com', password: 'password123', role: 'engineer', phone: '+2348022223344', status: 'active', employee_id: 'EMP-2026-0008', position: 'Structural Inspector', department: 'Structural Engineering', address: 'Gwarimpa Heights, Abuja', emergency_contact: 'Maryam Danbaki (+234802222111)', salary: 480000, leave_balance: 18, joined_date: '2025-02-01', photo: '/team-abdullahi.png', created_at: new Date() },
    { id: 9, name: 'Khalid Yakubu Haladu', email: 'khalid.haladu@archillery.com', password: 'password123', role: 'supervisor', phone: '+2348033334466', status: 'active', employee_id: 'EMP-2026-0009', position: 'Assistant Supervisor', department: 'Site Operations', address: 'Karamajiri District, Abuja', emergency_contact: 'Hadiza Khalid (+234803333111)', salary: 380000, leave_balance: 18, joined_date: '2025-03-10', photo: '/team-supervisor3.png', created_at: new Date() },
    { id: 10, name: 'Sulaiman Yakubu Saleh', email: 'sulaiman.saleh@archillery.com', password: 'password123', role: 'engineer', phone: '+2348044445577', status: 'active', employee_id: 'EMP-2026-0010', position: 'Civil Inspector', department: 'Structural Engineering', address: 'Ubeb Site Camp, Abuja', emergency_contact: 'Saleh Yakubu (+234804444000)', salary: 450000, leave_balance: 18, joined_date: '2025-05-15', photo: '/team-usman.png', created_at: new Date() },
    { id: 11, name: 'Usman Abubakar Bappayo', email: 'usman.bappayo@archillery.com', password: 'password123', role: 'supervisor', phone: '+2348055556688', status: 'active', employee_id: 'EMP-2026-0011', position: 'Shift Supervisor III', department: 'Site Operations', address: 'Gombe Investment Quarters', emergency_contact: 'Usman Bappayo (+234805555000)', salary: 380000, leave_balance: 18, joined_date: '2025-06-20', photo: '/team-pm.jpg', created_at: new Date() },
    { id: 12, name: 'Abdullahi Umar A.', email: 'abdullahi.umar@archillery.com', password: 'password123', role: 'engineer', phone: '+2348066667799', status: 'active', employee_id: 'EMP-2026-0012', position: 'Quality Inspector', department: 'Structural Engineering', address: 'Wuse 2 Zone 4, Abuja', emergency_contact: 'Umar Abdullahi (+234806666111)', salary: 480000, leave_balance: 18, joined_date: '2025-07-25', photo: '/team-engineer.png', created_at: new Date() },
    
    // Workers (Field Staff)
    { id: 13, name: 'Garba Musa', email: 'worker@archillery.com', password: 'password123', role: 'worker', phone: '+2348077778800', status: 'active', employee_id: 'EMP-2026-0013', position: 'Excavator Operator', department: 'Operations / Labor', address: 'Sahara Site Dorms, Abuja', emergency_contact: 'Musa Garba (+234807777222)', salary: 180000, leave_balance: 15, joined_date: '2025-10-01', photo: '/default-avatar.svg', created_at: new Date() },
    { id: 14, name: 'John Audu', email: 'worker2@archillery.com', password: 'password123', role: 'worker', phone: '+2348088889911', status: 'active', employee_id: 'EMP-2026-0014', position: 'Concrete Mason', department: 'Operations / Labor', address: 'Area II Site Dorms, Abuja', emergency_contact: 'Audu John (+234808888000)', salary: 150000, leave_balance: 15, joined_date: '2025-11-15', photo: '/default-avatar.svg', created_at: new Date() }
  ],
  projects: [
    {
      id: 1,
      name: 'B95 Sahara Estate',
      description: 'A premium 4-bedroom smart duplex with a Boys Quarters (BQ) and structural concrete integrity in Gwarimpa.',
      location: 'Sahara Estate Gwarimpa, Abuja',
      client_name: 'Sahara Estates Ltd',
      start_date: '2025-10-01',
      end_date: '2026-04-30',
      budget: 180000.00,
      status: 'completed',
      cover_image: '/b95-sahara-1.jpg',
      specs: {
        "Foundation": "Deep Strip Concrete Footing",
        "Concrete Grade": "C30/37 Strength Index",
        "Built Area": "480 sqm",
        "Completed Date": "April 2026",
        "Structural Steel": "High Tensile TMT Reinforcement"
      },
      features: [
        "4 Bedrooms + detached BQ",
        "Full Ensuite Bathrooms",
        "Pre-wired Solar Power Grid",
        "Smart Home Security Automation",
        "C of O Verified Land Title",
        "Premium Landscaped Driveways"
      ],
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Area II Shopping Complex',
      description: 'A modern mixed-use business complex designed to accommodate corporate offices, retail outlets, and professional service spaces.',
      location: 'Area II, Abuja, Nigeria',
      client_name: 'FCT Development Authority',
      start_date: '2026-02-15',
      end_date: '2027-02-15',
      budget: 650000.00,
      status: 'active',
      cover_image: '/area2-complex-cover.jpg',
      specs: {
        "Foundation": "Reinforced Concrete Raft",
        "Facade Style": "Modern Glazed Structural Glass Panels",
        "Levels": "Basement + Ground Floor + Upper Floors",
        "Structure": "Reinforced Concrete skeletal frame",
        "Vertical Transport": "High-Speed Passenger Elevators"
      },
      features: [
        "Underground Parking Garage",
        "Modern Commercial Architecture",
        "Open-Plan Office Units",
        "Large Glazed Facade for Natural Light",
        "Dedicated Power Substation",
        "COREN Structural Approvals"
      ],
      created_at: new Date()
    },
    {
      id: 3,
      name: '6 Bedrooms Duplex',
      description: 'A high-end 6-bedroom duplex development built to premium architectural standards inside Andhi Khan Beulah Estate.',
      location: 'Andhi Khan Beulah Estate, Gwarimpa, Abuja',
      client_name: 'Private Investor',
      start_date: '2025-05-10',
      end_date: '2025-11-20',
      budget: 320000.00,
      status: 'completed',
      cover_image: '/gwarimpa-6bd-1.jpg',
      specs: {
        "Foundation": "Reinforced Raft Foundation",
        "Concrete Grade": "C30/37 Strength Index",
        "Built Area": "580 sqm",
        "Completed Date": "November 2025",
        "Structural Steel": "High Tensile TMT Reinforcement"
      },
      features: [
        "6 Ensuite Bedrooms",
        "Spacious Penthouse Suite",
        "Modern Gated Entrance",
        "Security Guard Post",
        "C of O Verified Land Title",
        "Paved Perimeter Access Road"
      ],
      created_at: new Date()
    },
    {
      id: 4,
      name: '4 Bedrooms Bungalow (Gombe)',
      description: 'A modern 4-bedroom residential bungalow built to high standards inside Investment Quarters, Gombe.',
      location: 'Investment Quarters, Gombe State',
      client_name: 'Gombe Land Trust',
      start_date: '2025-12-01',
      end_date: '2026-06-30',
      budget: 140000.00,
      status: 'completed',
      cover_image: '/gombe-bungalow-1.png',
      specs: {
        "Foundation": "Reinforced Strip Footing",
        "Built Area": "320 sqm",
        "Completed Date": "June 2026",
        "Roofing Profile": "Stone-Coated Aluminium Tiles",
        "Electrical Wiring": "Double-Line Armored Cables"
      },
      features: [
        "4 Ensuite Bedrooms",
        "Stone-Clad Window Borders",
        "Paved Interlocking Driveway",
        "Security Razor Fencing",
        "COREN-Certified Sign-Offs",
        "Central Water Boring"
      ],
      created_at: new Date()
    },
    {
      id: 5,
      name: '4 Bedrooms Bungalow (Life Camp)',
      description: 'A high-end 4-bedroom residential bungalow built to premium architectural standards inside Marcon Estate.',
      location: 'Marcon Estate, Life Camp, Abuja, FCT',
      client_name: 'Mr. & Mrs. Danladi',
      start_date: '2025-11-15',
      end_date: '2026-05-15',
      budget: 155000.00,
      status: 'completed',
      cover_image: '/marcon-bungalow-1.png',
      specs: {
        "Foundation": "Reinforced Strip Footing",
        "Built Area": "350 sqm",
        "Completed Date": "May 2026",
        "Roofing Profile": "Stone-Coated Aluminium Tiles"
      },
      features: [
        "4 Ensuite Bedrooms",
        "Stone-Clad Pillars",
        "Electric Fence Security",
        "Step-Free Access Layout",
        "COREN-Certified Sign-Offs",
        "C of O Verified Land Title"
      ],
      created_at: new Date()
    },
    {
      id: 6,
      name: 'Bonara Hotel/Apartments',
      description: 'A premium commercial hospitality hotel development featuring modern architectural facades and secure parameter perimeter fencing in Gwarinpa.',
      location: 'Gwarinpa, FCT, Abuja',
      client_name: 'Bonara Suites Group',
      start_date: '2025-08-01',
      end_date: '2026-06-28',
      budget: 580000.00,
      status: 'completed',
      cover_image: '/bonara-hotel.jpg',
      specs: {
        "Foundation": "Reinforced Raft Foundation",
        "Concrete Grade": "C30/37 Strength Index",
        "Built Area": "620 sqm",
        "Completed Date": "June 2026",
        "Structural Steel": "High Tensile TMT Reinforcement"
      },
      features: [
        "Hospitality Suites Layout",
        "Modern Exterior Facades",
        "Security-Spiked Perimeter Wall",
        "High-Tensile Steel Slabs",
        "C of O Verified Land Title"
      ],
      created_at: new Date()
    },
    {
      id: 7,
      name: '8 Bedrooms Duplex',
      description: 'A high-end 8-bedroom residential duplex built to premium structural engineering specifications in Lokogoma.',
      location: 'Lokogoma, FCT, Abuja',
      client_name: 'Engr. Musa Dan-Baki',
      start_date: '2025-09-01',
      end_date: '2026-05-10',
      budget: 280000.00,
      status: 'completed',
      cover_image: '/lokogoma-8bd-1.jpg',
      specs: {
        "Foundation": "Reinforced Raft Foundation",
        "Concrete Grade": "C30/37 Strength Index",
        "Built Area": "680 sqm",
        "Completed Date": "May 2026",
        "Structural Steel": "High Tensile TMT Reinforcement"
      },
      features: [
        "8 Ensuite Bedrooms",
        "Stone-Clad Pillars",
        "Premium Gated Fencing",
        "Load-Bearing concrete frame",
        "COREN-Certified Sign-Offs",
        "C of O Verified Land Title"
      ],
      created_at: new Date()
    },
    {
      id: 8,
      name: 'Ubeb Project',
      description: 'Partial completion and structural rehabilitation of a commercial administrative office block in Kado.',
      location: 'Kado, FCT, Abuja',
      client_name: 'Abuja Education Board',
      start_date: '2026-01-10',
      end_date: '2026-12-15',
      budget: 890000.00,
      status: 'active',
      cover_image: '/ubeb-project-1.png',
      specs: {
        "Scope": "Partial Completion & Rehabilitation",
        "Built Area": "950 sqm",
        "Structure": "Reinforced Concrete Frame Work",
        "Interior Finishes": "Suspended Acoustic Ceiling & Marble Tiling"
      },
      features: [
        "Commercial Office Open Layouts",
        "Reinforced Concrete Skeleton",
        "Suspended Ceiling Panels",
        "High-Durability Floor Tiling",
        "Ongoing Site Supervision Log",
        "Vetted Structural Drawings"
      ],
      created_at: new Date()
    },
    {
      id: 9,
      name: "Renovation of Chairman's Office",
      description: 'Interior renovation, layout optimization, and security structural upgrades for the State Board of Internal Revenue Chairman executive suite.',
      location: 'Gombe State Board of Internal Revenue, Gombe',
      client_name: 'Gombe State Government',
      start_date: '2026-03-01',
      end_date: '2026-06-25',
      budget: 95000.00,
      status: 'completed',
      specs: {
        "Scope": "Interior Renovation & Security Upgrades",
        "Built Area": "120 sqm",
        "Finishes": "Executive Custom Joinery & Wall Cladding"
      },
      features: [
        "Executive Office Open Layout",
        "Custom Timber Veneer Panelwork",
        "High-Security Access Locksets",
        "Integrated Smart Climate Controls"
      ],
      created_at: new Date()
    }
  ],
  tasks: [
    {
      id: 1,
      project_id: 2,
      assigned_to: 13,
      title: 'Scaffolding Safety Rigging',
      description: 'Erect steel structural scaffolding towers around Sector C storefront facade. Double check load-bearing clamps.',
      due_date: '2026-08-10',
      status: 'in_progress',
      priority: 'high',
      created_at: new Date()
    },
    {
      id: 2,
      project_id: 8,
      assigned_to: 14,
      title: 'Concrete Skeletal Beam Casting',
      description: 'Perform casting of concrete columns supporting the administrative wings. Verify reinforcement steel alignment.',
      due_date: '2026-08-18',
      status: 'pending',
      priority: 'medium',
      created_at: new Date()
    },
    {
      id: 3,
      project_id: 2,
      assigned_to: 13,
      title: 'Soil Leveling & Site Grading',
      description: 'Perform mechanical grading and sub-base leveling for the underground car park ramp.',
      due_date: '2026-06-25',
      status: 'completed',
      priority: 'high',
      created_at: new Date()
    }
  ],
  attendance: [
    { id: 1, user_id: 13, date: '2026-07-25', status: 'present', check_in_time: '08:02:15', check_out_time: '17:05:00', notes: 'Checked in on-site.', created_at: new Date() },
    { id: 2, user_id: 14, date: '2026-07-25', status: 'present', check_in_time: '08:15:30', check_out_time: '17:10:00', notes: 'Arrived for concrete mix.', created_at: new Date() },
    { id: 3, user_id: 13, date: '2026-07-26', status: 'present', check_in_time: '07:55:00', check_out_time: null, notes: 'Excavator check.', created_at: new Date() },
    { id: 4, user_id: 14, date: '2026-07-26', status: 'late', check_in_time: '08:45:00', check_out_time: null, notes: 'Traffic delays.', created_at: new Date() }
  ],
  progress_updates: [
    { id: 1, project_id: 2, updated_by: 5, description: 'Geotechnical soil investigation signed off. Ground excavation down to 5 meters completed.', image_url: null, update_date: '2026-03-01', created_at: new Date() },
    { id: 2, project_id: 8, updated_by: 7, description: 'Skeletal concrete frames for columns 1 to 14 poured and set. Commencing brickwork masonry layout.', image_url: null, update_date: '2026-06-20', created_at: new Date() }
  ],
  rfis: [
    {
      id: 1,
      project_id: 2,
      created_by: 7,
      assigned_to: 12,
      subject: 'Sector C Column Discrepancy',
      question: 'The structural drawing sheet S-02 shows column C4 with 8Y20 rebar reinforcement, but the architectural layout sheet A-04 shows it as a partition wall. Please verify column coordinate placement.',
      answer: 'Structural drawing S-02 is correct. Column C4 is load-bearing and cannot be deleted or converted to a wall partition.',
      status: 'answered',
      attachment_url: null,
      created_at: new Date('2026-07-20'),
      answered_at: new Date('2026-07-22')
    },
    {
      id: 2,
      project_id: 8,
      created_by: 7,
      assigned_to: 12,
      subject: 'Elevator Shaft Dimensions',
      question: 'Vertical transport shaft dimensions do not match Otis elevator model specs supplied. We need confirmation on whether to increase width by 150mm.',
      answer: null,
      status: 'open',
      attachment_url: null,
      created_at: new Date('2026-07-26'),
      answered_at: null
    }
  ],
  boq_items: [
    { id: 1, project_id: 2, item_code: 'SUB-01', description: 'Excavation of site down to basement level 5m', category: 'Substructure', unit: 'm3', quantity: 2400.00, unit_rate: 15.00 },
    { id: 2, project_id: 2, item_code: 'SUB-02', description: 'Concrete raft foundation casting C30 mix', category: 'Substructure', unit: 'm3', quantity: 850.00, unit_rate: 180.00 },
    { id: 3, project_id: 2, item_code: 'CON-01', description: 'Reinforced concrete columns framing Sector A', category: 'Concrete', unit: 'm3', quantity: 450.00, unit_rate: 220.00 },
    { id: 4, project_id: 2, item_code: 'CON-02', description: 'Slab concrete casting first floor', category: 'Concrete', unit: 'm3', quantity: 600.00, unit_rate: 210.00 },
    { id: 5, project_id: 2, item_code: 'MAS-01', description: 'External sandcrete brickwork masonry block walls', category: 'Masonry', unit: 'sqm', quantity: 3800.00, unit_rate: 28.00 },
    { id: 6, project_id: 2, item_code: 'FIN-01', description: 'Acoustic suspended ceiling layouts', category: 'Finishes', unit: 'sqm', quantity: 1800.00, unit_rate: 35.00 },
    { id: 7, project_id: 2, item_code: 'FIN-02', description: 'Glazed structural safety glass shopfronts', category: 'Finishes', unit: 'sqm', quantity: 250.00, unit_rate: 266.00 },
    
    { id: 8, project_id: 8, item_code: 'REH-01', description: 'Structural skeletal rehabilitation beams', category: 'Concrete', unit: 'm3', quantity: 320.00, unit_rate: 240.00 },
    { id: 9, project_id: 8, item_code: 'REH-02', description: 'Masonry brickwork partitions', category: 'Masonry', unit: 'sqm', quantity: 4200.00, unit_rate: 30.00 },
    { id: 10, project_id: 8, item_code: 'REH-03', description: 'Polished marble floor tiling', category: 'Finishes', unit: 'sqm', quantity: 1400.00, unit_rate: 55.00 }
  ],
  material_requisitions: [
    {
      id: 1,
      project_id: 2,
      requested_by: 5,
      item_details: [
        { item_desc: 'High Tensile Steel TMT Rebars Y20', qty: 45, unit: 'tons', est_rate: 850.00 },
        { item_desc: 'Portland Cement Grade 42.5', qty: 600, unit: 'bags', est_rate: 12.00 }
      ],
      estimated_cost: 45450.00,
      status: 'lpo_generated',
      approved_by: 4,
      created_at: new Date('2026-07-22')
    },
    {
      id: 2,
      project_id: 8,
      requested_by: 7,
      item_details: [
        { item_desc: 'Polished Marble Tiles 60x60', qty: 1200, unit: 'sqm', est_rate: 45.00 }
      ],
      estimated_cost: 54000.00,
      status: 'pending_approval',
      approved_by: null,
      created_at: new Date('2026-07-26')
    }
  ],
  lpos: [
    {
      id: 1,
      requisition_id: 1,
      project_id: 2,
      vendor_name: 'Dangote Industries Ltd',
      lpo_number: 'LPO-2026-0089',
      total_amount: 45450.00,
      status: 'issued',
      created_by: 4,
      created_at: new Date('2026-07-23')
    }
  ],
  grns: [
    {
      id: 1,
      lpo_id: 1,
      project_id: 2,
      received_by: 7,
      delivery_details: [
        { item_desc: 'High Tensile Steel TMT Rebars Y20', ordered_qty: 45, received_qty: 45, discrep_notes: '' },
        { item_desc: 'Portland Cement Grade 42.5', ordered_qty: 600, received_qty: 580, discrep_notes: '20 bags split/damaged during offloading' }
      ],
      delivery_note_ref: 'DN-9988-DAN',
      status: 'partially_received',
      created_at: new Date('2026-07-25')
    }
  ],
  snags: [
    {
      id: 1,
      project_id: 2,
      floor_plan_ref: 'default_floorplan.jpg',
      pin_x: 32.50,
      pin_y: 44.10,
      description: 'Honeycomb concrete void observed at column C4 base. Requires epoxy concrete structural grout.',
      defect_type: 'Concrete Work',
      assigned_to: 13,
      photo_url: null,
      status: 'open',
      signed_off_by: null,
      created_at: new Date('2026-07-25')
    },
    {
      id: 2,
      project_id: 2,
      floor_plan_ref: 'default_floorplan.jpg',
      pin_x: 68.20,
      pin_y: 15.80,
      description: 'Exposed conduit wiring inside shopfront partition wall requires secure termination.',
      defect_type: 'Electrical Work',
      assigned_to: 14,
      photo_url: null,
      status: 'resolved',
      signed_off_by: null,
      created_at: new Date('2026-07-25')
    }
  ],
  daily_logs: [
    {
      id: 1,
      project_id: 2,
      logged_by: 6,
      log_date: '2026-07-25',
      weather_am: 'Sunny, 28C',
      weather_pm: 'Clear, 32C',
      labor_details: { 'Masons': 12, 'Steel Fixers': 8, 'Plumbers': 2 },
      equipment_details: { 'Concrete Mixer': 6.0, 'Tower Crane': 4.0 },
      materials_received: '45 tons steel rebars Y20 and 580 bags cement (Dangote delivery LPO #0089).',
      created_at: new Date('2026-07-25')
    }
  ],
  leaves: [
    { id: 1, user_id: 13, name: 'Garba Musa', position: 'Excavator Operator', start_date: '2026-08-01', end_date: '2026-08-15', reason: 'Annual Leave Request', status: 'pending', type: 'annual', created_at: new Date() },
    { id: 2, user_id: 5, name: 'Musa Abubakar Dan-Baki', position: 'Senior Site Supervisor', start_date: '2026-09-10', end_date: '2026-09-14', reason: 'Family emergency / check-up', status: 'approved', type: 'sick', created_at: new Date() }
  ],
  vacancies: [
    { id: 1, title: 'Assistant Site Engineer', department: 'Operations', status: 'open', applicationsCount: 4, date_posted: '2026-07-20' },
    { id: 2, title: 'Quantity Surveyor (Intern)', department: 'Finance', status: 'closed', applicationsCount: 12, date_posted: '2026-06-15' }
  ],
  interviews: [
    { id: 1, candidate_name: 'David Ojo', vacancy_title: 'Assistant Site Engineer', date: '2026-08-03T10:00:00.000Z', status: 'scheduled' }
  ]
};
