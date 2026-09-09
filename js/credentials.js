/**
 * TEMPORARY HARDCODED CREDENTIAL STORAGE
 * This is a temporary solution for storing BHW and Admin credentials.
 * In production, this should be replaced with a proper database backend.
 * 
 * SECURITY NOTE: This is for development/testing purposes only.
 * Never store passwords in plain text in production.
 */

// Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// BHW User Credentials Database
// Real BHW personnel from Barangay New Katipunan, Matanao, Davao del Sur
const BHW_CREDENTIALS = [
  {
    id: 'bhw001',
    firstName: 'Prelin',
    lastName: 'Veriño',
    middleInitial: 'L',
    contact: '09171234567',
    dob: '1985-03-15',
    password: 'prelin123',
    status: 'active',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw002',
    firstName: 'Flora',
    lastName: 'Tangoan',
    middleInitial: 'L',
    contact: '09182345678',
    dob: '1987-06-22',
    password: 'flora123',
    status: 'active',
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw003',
    firstName: 'Virginia',
    lastName: 'Escorial',
    middleInitial: 'A',
    contact: '09193456789',
    dob: '1982-09-10',
    password: 'virginia123',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw004',
    firstName: 'Rosalie',
    lastName: 'Villarin',
    middleInitial: 'E',
    contact: '09204567890',
    dob: '1990-02-25',
    password: 'rosalie123',
    status: 'active',
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw005',
    firstName: 'Jessie',
    lastName: 'Pia',
    middleInitial: 'A',
    contact: '09215678901',
    dob: '1988-11-18',
    password: 'jessie123',
    status: 'active',
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw006',
    firstName: 'Rosevilla',
    lastName: 'Siarez',
    middleInitial: 'A',
    contact: '09226789012',
    dob: '1991-04-07',
    password: 'rosevilla123',
    status: 'active',
    lastLogin: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw007',
    firstName: 'Margarita',
    lastName: 'Millan',
    middleInitial: 'G',
    contact: '09237890123',
    dob: '1986-08-14',
    password: 'margarita123',
    status: 'active',
    lastLogin: new Date(Date.now() - 432000000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'bhw008',
    firstName: 'Bernardita',
    lastName: 'Caduada',
    middleInitial: 'T',
    contact: '09248901234',
    dob: '1989-12-03',
    password: 'bernardita123',
    status: 'active',
    lastLogin: new Date(Date.now() - 518400000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  }
];

// Helper function to generate BHW ID
function generateBHWId() {
  const maxId = BHW_CREDENTIALS.reduce((max, user) => {
    const num = parseInt(user.id.replace('BHW', ''));
    return num > max ? num : max;
  }, 0);
  
  const newId = maxId + 1;
  return `BHW${String(newId).padStart(3, '0')}`;
}

// Helper function to generate auto password
function generatePassword(firstName, lastName) {
  // Simple password generation: firstname + lastname + 123
  // In production, use a more secure password generation method
  const baseName = (firstName + lastName).toLowerCase().replace(/[^a-z]/g, '');
  return `${baseName}123`;
}

// Helper function to validate BHW login
function validateBHWLogin(username, password) {
  const user = BHW_CREDENTIALS.find(u => 
    u.id === username || 
    `${u.firstName}${u.lastName}`.toLowerCase() === username.toLowerCase()
  );
  
  if (user && user.password === password && user.status === 'active') {
    return user;
  }
  return null;
}

// Helper function to get user by ID
function getUserById(userId) {
  return BHW_CREDENTIALS.find(u => u.id === userId);
}

// Helper function to add new user
function addUser(userData) {
  const newId = generateBHWId();
  const autoPassword = generatePassword(userData.firstName, userData.lastName);
  
  const newUser = {
    id: newId,
    firstName: userData.firstName,
    lastName: userData.lastName,
    middleInitial: userData.middleInitial || '',
    contact: userData.contact,
    dob: userData.dob,
    password: autoPassword,
    status: 'active', // Default to active
    lastLogin: null,
    createdAt: new Date().toISOString()
  };
  
  BHW_CREDENTIALS.push(newUser);
  return newUser;
}

// Helper function to update user
function updateUser(userId, userData) {
  const userIndex = BHW_CREDENTIALS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    BHW_CREDENTIALS[userIndex] = {
      ...BHW_CREDENTIALS[userIndex],
      ...userData
    };
    return BHW_CREDENTIALS[userIndex];
  }
  return null;
}

// Helper function to delete user
function deleteUser(userId) {
  const userIndex = BHW_CREDENTIALS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const deletedUser = BHW_CREDENTIALS.splice(userIndex, 1)[0];
    return deletedUser;
  }
  return null;
}

// Helper function to toggle user status
function toggleUserStatus(userId) {
  const user = BHW_CREDENTIALS.find(u => u.id === userId);
  if (user) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    return user;
  }
  return null;
}

// Export for use in other files (if using modules)
// For now, these will be used directly in admin.js