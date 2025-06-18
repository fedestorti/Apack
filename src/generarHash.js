// generarHash.js
import bcrypt from 'bcrypt';
const password = '@pack2025';

bcrypt.hash(password, 10).then(hash => {
  console.log('Hash generado:', hash);
});