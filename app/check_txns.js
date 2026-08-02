import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBtUtokjQfOvRlKaXioYz-4BevOSnj6h4w',
  authDomain: 'smokescreen-2bc84.firebaseapp.com',
  projectId: 'smokescreen-2bc84',
  storageBucket: 'smokescreen-2bc84.firebasestorage.app',
  messagingSenderId: '461923381527',
  appId: '1:461923381527:web:d4aea1b1c58081d5364752',
  measurementId: 'G-JQK7K10TNC',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  console.log('--- TRANSACTIONS ---');
  const txnsSnap = await getDocs(collection(db, 'transactions_nbb'));
  txnsSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`Doc ID: ${doc.id}`);
    console.log(`  User ID (user_id): ${data.user_id}`);
    console.log(`  Description: ${data.description}`);
    console.log(`  Amount: ${data.amount}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Date: ${data.date?.toDate ? data.date.toDate().toISOString() : data.date}`);
  });

  process.exit(0);
}

checkDatabase().catch(console.error);
