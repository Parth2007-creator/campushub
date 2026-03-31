import { db, isConfigured } from './firebase.js';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const inventoryGrid = document.getElementById('inventory-grid');
const availableCount = document.getElementById('count-available'); // Optional if added later

function formatTimeAgo(date) {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

function createItemCard(item, id) {
    const card = document.createElement('div');
    card.className = "neumorphic-flat p-6 rounded-xl transition-all duration-300 neumorphic-card-hover group";
    
    // Fallback image handling
    const imageUrl = item.itemPhotoUrl || 'https://via.placeholder.com/300?text=No+Photo';
    
    const timeAgo = formatTimeAgo(item.storedAt?.toDate());
    
    card.innerHTML = `
        <div class="relative overflow-hidden rounded-lg mb-6 aspect-square">
            <img alt="Lost Item" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${imageUrl}"/>
            <div class="absolute top-4 left-4">
                <span class="bg-white/80 backdrop-blur-md text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Available</span>
            </div>
        </div>
        <h3 class="text-xl font-bold font-headline mb-1 overflow-hidden text-ellipsis whitespace-nowrap" title="${item.studentEmailId}">Item</h3>
        <p class="text-xs text-outline font-medium mb-1">Found by: ${item.studentEmailId}</p>
        <div class="flex items-center text-on-surface-variant text-sm mb-6 space-x-2">
            <span class="material-symbols-outlined text-xs">location_on</span>
            <span class="font-medium">Station ${item.stationId || 'Unknown'}</span>
            <span class="text-outline-variant">•</span>
            <span class="font-mono text-xs">${timeAgo}</span>
        </div>
        <button data-id="${id}" class="claim-btn w-full py-4 rounded-full bg-gradient-to-br from-[#89F7FE] to-[#66A6FF] text-white font-bold shadow-lg transition-all active:scale-95 active:shadow-inner flex items-center justify-center space-x-2">
            <span>Claim Item manually</span>
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
    `;
    
    return card;
}

if (isConfigured) {
    // Subscribe to real-time updates for "stored" items
    const q = query(
        collection(db, 'lostAndFound'), 
        where('status', '==', 'stored'),
        orderBy('storedAt', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        inventoryGrid.innerHTML = ''; // clear loading state or old items
        
        if (snapshot.empty) {
            inventoryGrid.innerHTML = `
                <div class="col-span-full py-12 text-center">
                    <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
                    <p class="text-on-surface-variant tracking-wide font-medium">No lost items stored currently.</p>
                </div>
            `;
            return;
        }
        
        snapshot.forEach((doc) => {
            const item = doc.data();
            const card = createItemCard(item, doc.id);
            inventoryGrid.appendChild(card);
        });
        
        // Attach event listeners to all new claim buttons
        document.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const originalText = e.currentTarget.innerHTML;
                e.currentTarget.innerHTML = `<span>Claiming...</span>`;
                e.currentTarget.disabled = true;
                
                try {
                    await updateDoc(doc(db, 'lostAndFound', id), {
                        status: 'claimed',
                        claimedAt: serverTimestamp()
                    });
                    // Item will automatically disappear from UI via onSnapshot
                } catch (err) {
                    console.error("Error Claiming", err);
                    e.currentTarget.innerHTML = originalText;
                    e.currentTarget.disabled = false;
                    alert("Failed to claim item. Check console.");
                }
            });
        });
    });
} else {
    console.warn("Using mock lost-and-found data because Firebase API keys are not supplied yet.");
    inventoryGrid.innerHTML = `
        <div class="col-span-full py-12 text-center">
            <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
            <p class="text-on-surface-variant tracking-wide font-medium">No lost items stored currently. (Waiting for Firebase Setup)</p>
        </div>
    `;
}
