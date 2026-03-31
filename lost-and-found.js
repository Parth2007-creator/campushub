import { db, rtdb } from './firebase.js';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, serverTimestamp, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import {
  ref, set
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const grid = document.getElementById('inventory-grid');

function formatTime(date) {
  if (!date) return "now";
  return new Date(date).toLocaleString();
}

function createCard(item, id) {

  const el = document.createElement('div');

  el.innerHTML = `
  <div class="neumorphic-flat p-6 rounded-xl">
    <img src="${item.itemPhotoUrl}" class="rounded-lg mb-4"/>
    <p class="text-sm">PRN: ${item.studentPRN}</p>
    <p class="text-xs">${formatTime(item.storedAt?.toDate())}</p>

    <button data-id="${id}" class="claim-btn btn mt-4">
      Claim Item
    </button>
  </div>
  `;

  return el;
}

// 🔥 LOAD ITEMS
const q = query(
  collection(db, "lostAndFound"),
  where("status", "==", "stored"),
  orderBy("storedAt", "desc")
);

onSnapshot(q, (snap) => {

  grid.innerHTML = "";

  snap.forEach(docSnap => {
    const card = createCard(docSnap.data(), docSnap.id);
    grid.appendChild(card);
  });

  // CLAIM
  document.querySelectorAll(".claim-btn").forEach(btn => {
    btn.onclick = async () => {

      const id = btn.dataset.id;

      await updateDoc(doc(db, "lostAndFound", id), {
        status: "claimed",
        claimedAt: serverTimestamp()
      });

      // 🔥 OPEN LOCKER
      await set(ref(rtdb, "commands"), {
        action: "open"
      });

      alert("Locker Opened 🔓");
    };
  });

});
