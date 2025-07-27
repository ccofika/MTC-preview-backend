// Mock admin users for development without MongoDB
const bcryptjs = require('bcryptjs');

const mockAdminUsers = [
  {
    _id: 'admin1',
    username: 'admin',
    email: 'admin@nissal.rs',
    password: bcryptjs.hashSync('admin123', 10), // password: admin123
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-07-26')
  },
  {
    _id: 'admin2', 
    username: 'nissal_admin',
    email: 'admin@nissalgroup.com',
    password: bcryptjs.hashSync('nissal2024', 10), // password: nissal2024
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-07-26')
  }
];

const findUserByCredentials = async (username, password) => {
  const user = mockAdminUsers.find(u => 
    (u.username === username || u.email === username) && u.isActive
  );
  
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const findUserById = (id) => {
  const user = mockAdminUsers.find(u => u._id === id && u.isActive);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  mockAdminUsers,
  findUserByCredentials,
  findUserById
};