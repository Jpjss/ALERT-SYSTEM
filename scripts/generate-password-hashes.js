import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = {
    admin: 'admin123',
    manager: 'manager123',
    user: 'user123',
  };

  console.log('Gerando hashes de senha...\n');

  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role}: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }
}

generateHashes().catch(console.error);
