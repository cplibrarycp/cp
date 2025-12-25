import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

/**
 * 1. ലോഗൗട്ട് ഫംഗ്‌ഷൻ (Logout Function)
 * ലോഗൗട്ട് ചെയ്താൽ 'logout-success.html' പേജിലേക്ക് പോകുന്നു.
 */
window.logoutUser = function() {
    const auth = getAuth();
    if (confirm("നിങ്ങൾക്ക് ലോഗൗട്ട് ചെയ്യണോ?")) {
        signOut(auth).then(() => {
            window.location.href = "logout-success.html"; 
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    }
};

/**
 * 2. പ്രൊഫൈൽ ഡ്രോപ്പ്ഡൗൺ ലോജിക് (Dropdown Logic)
 * ഹെഡറിലെ പ്രൊഫൈൽ ചിത്രത്തിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ മെനു തുറക്കാൻ.
 */
function initProfileDropdown() {
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');

    if (profileBtn && dropdown) {
        profileBtn.onclick = function(e) {
            e.stopPropagation();
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        };

        // പേജിൽ മറ്റെവിടെ ക്ലിക്ക് ചെയ്താലും മെനു അടയും
        window.onclick = function() {
            dropdown.style.display = 'none';
        };
    }
}

/**
 * 3. സെർച്ച് ബാർ ഫംഗ്‌ഷൻ (Search Bar Logic)
 * പുസ്തക വിഭാഗങ്ങൾ തിരയാൻ സഹായിക്കുന്നു.
 */
window.searchCategories = function() {
    const input = document.getElementById('searchBar');
    if (!input) return;
    const filter = input.value.toUpperCase();
    const cards = document.getElementsByClassName('category-card');
    
    for (let i = 0; i < cards.length; i++) {
        const label = cards[i].querySelector(".category-label") || cards[i].querySelector(".label");
        if (label) {
            const txtValue = label.textContent || label.innerText;
            cards[i].style.display = (txtValue.toUpperCase().indexOf(filter) > -1) ? "" : "none";
        }
    }
};

// പേജ് ലോഡ് ആകുമ്പോൾ ഡ്രോപ്പ്ഡൗൺ ലോജിക് ആക്റ്റീവ് ആക്കുന്നു
document.addEventListener('DOMContentLoaded', initProfileDropdown);
