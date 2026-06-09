const mongoose = require('mongoose');
require('dotenv').config({ path: 'apps/api/.env' });

async function checkDb() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const User = require('./apps/api/dist/app/modules/auth/user.model').default;
  
  const users = await User.find({});
  console.log('All Users in DB:');
  users.forEach(u => {
    console.log(`- ${u.email}: phone=${u.phone}, avatar=${u.avatar}`);
  });
  
  process.exit(0);
}

checkDb().catch(console.error);
