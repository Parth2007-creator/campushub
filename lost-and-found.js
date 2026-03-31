import { db, rtdb } from './firebase.js';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, serverTimestamp, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { ref, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const grid = document.getElementById('inventory-grid');

// TIME FORMAT
function formatTimeAgo(date) {
  if (!date) return "now";
  return new Date(date).toLocaleString();
}

// CARD UI (MATCHES YOUR DESIGN)
function createCard(item, id) {

  const div = document.createElement("div");

  div.className = "neumorphic-flat p-6 rounded-xl transition-all duration-300 neumorphic-card-hover group";

  div.innerHTML = `
    <div class="relative overflow-hidden rounded-lg mb-6 aspect-square">
      <img src="${item.itemPhotoUrl}" class="w-full h-full object-cover"/>
    </div>

    <p class="text-sm font-bold mb-1">PRN: ${item.studentPRN || "Unknown"}</p>

    <p class="text-xs text-outline mb-4">
      ${formatTimeAgo(item.storedAt?.toDate())}
    </p>

    <button data-id="${id}" class="claim-btn w-full py-3 rounded-full bg-gradient-to-br from-[#89F7FE] to-[#66A6FF] text-white font-bold">
      Claim Item
    </button>
  `;

  return div;
}

// LOAD ITEMS
const q = query(
  collection(db, "lostAndFound"),
  where("status", "==", "stored"),
  orderBy("storedAt", "desc")
);

onSnapshot(q, (snapshot) => {

  grid.innerHTML = "";

  if(snapshot.empty){
    grid.innerHTML = `<p class="col-span-full text-center">No items</p>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const card = createCard(docSnap.data(), docSnap.id);
    grid.appendChild(card);
  });

  // CLAIM BUTTON
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
