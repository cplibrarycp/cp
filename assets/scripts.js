// --- THRIPUDI LIBRARY MASTER SCRIPT (V5 - ALL FEATURES RESTORED) ---

const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
let bgMusic;

// --- 1. മ്യൂസിക് സിസ്റ്റം ---
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mp3" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2;

    const findHeaderAndInject = setInterval(() => {
        const navLinks = document.querySelector('.nav-links') || document.querySelector('.navbar') || document.querySelector('header .container');
        if (navLinks && !document.getElementById('music-nav-item')) {
            const musicBtnHTML = `<a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin-right:10px;"><i id="music-icon" class="fas fa-volume-mute"></i> Music</a>`;
            navLinks.insertAdjacentHTML('afterbegin', musicBtnHTML);
            clearInterval(findHeaderAndInject);
        }
    }, 500);
    setTimeout(() => clearInterval(findHeaderAndInject), 5000);
}

window.toggleBGMusic = function() {
    const musicIcon = document.getElementById("music-icon");
    if (!bgMusic) bgMusic = document.getElementById("bgMusic");
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("User Interaction Required"));
        if(musicIcon) musicIcon.className = "fas fa-volume-up";
    } else {
        bgMusic.pause();
        if(musicIcon) musicIcon.className = "fas fa-volume-mute";
    }
};

// --- 2. ഡ്രോപ്പ്ഡൗൺ & പ്രൊഫൈൽ ---
function setupProfileDropdown() {
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileBtn && dropdown) {
        profileBtn.onclick = function(e) {
            e.stopPropagation();
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();
    setupProfileDropdown();

    const userAvatarImg = document.getElementById('user-avatar-img');
    const dName = document.getElementById('display-name');
    
    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
                if(userAvatarImg) userAvatarImg.src = user.photoURL ? user.photoURL : 'assets/cover/default_user.jpg';
            } else {
                if(userAvatarImg) userAvatarImg.src = 'assets/cover/default_user.jpg';
                if(dName) dName.innerText = "അതിഥി";
            }
            setupProfileDropdown();
        });
    }

    // ആദ്യ ക്ലിക്കിൽ മ്യൂസിക് സ്റ്റാർട്ട് ചെയ്യാൻ
    document.body.addEventListener('click', () => {
        if (bgMusic && bgMusic.paused && document.getElementById('music-icon').classList.contains("fa-volume-up")) {
            bgMusic.play();
        }
    }, { once: true });
});

window.onclick = function() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.style.display = 'none';
};

// --- 3. ആക്സസ്, ഹിസ്റ്ററി & ബാക്ക് ബട്ടൺ ---
window.checkAccess = function(id, type, cardId) {
    if (auth && !auth.currentUser) {
        if(document.getElementById('loginAlertModal')) document.getElementById('loginAlertModal').style.display = 'flex';
    } else {
        // --- ഹിസ്റ്ററി ലോജിക് (തിരികെ ചേർത്തു) ---
        const cardElement = document.getElementById(cardId);
        if (cardElement && auth.currentUser) {
            const bName = cardElement.querySelector('.book-title').innerText;
            const bThumb = cardElement.querySelector('.book-cover').src;
            let history = JSON.parse(localStorage.getItem('thripudi_history_' + auth.currentUser.uid)) || [];
            history = history.filter(item => item.id !== id);
            history.push({ id: id, name: bName, thumb: bThumb, date: new Date().toLocaleDateString('ml-IN') });
            localStorage.setItem('thripudi_history_' + auth.currentUser.uid, JSON.stringify(history.slice(-20)));
        }

        if(type !== 'pdf' && bgMusic) bgMusic.pause();

        if (type === 'audio') {
            document.getElementById('player-' + id).innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;"></iframe>`;
        } else if (type === 'video') {
            window.history.pushState({modalOpen: "video"}, ""); 
            document.getElementById('videoFrameContainer').innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;" allow="autoplay"></iframe>`;
            document.getElementById('videoOverlay').style.display = 'flex';
            document.body.style.overflow = "hidden";
        } else if (type === 'pdf') {
            window.history.pushState({modalOpen: "pdf"}, "");
            document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview`;
            document.getElementById('pdfModal').style.display = 'flex';
            document.body.style.overflow = "hidden";
        }
    }
};

window.onpopstate = function() {
    if (document.getElementById('videoOverlay').style.display === 'flex') closeVideoLogic();
    else if (document.getElementById('pdfModal').style.display === 'flex') closePdfLogic();
};

function closeVideoLogic() {
    if(document.getElementById('videoOverlay')) document.getElementById('videoOverlay').style.display = 'none';
    if(document.getElementById('videoFrameContainer')) document.getElementById('videoFrameContainer').innerHTML = "";
    document.body.style.overflow = "auto";
    const mIcon = document.getElementById("music-icon");
    if (bgMusic && mIcon && mIcon.classList.contains("fa-volume-up")) bgMusic.play();
}

function closePdfLogic() {
    if(document.getElementById('pdfModal')) document.getElementById('pdfModal').style.display = 'none';
    if(document.getElementById('pdfFrame')) document.getElementById('pdfFrame').src = "";
    document.body.style.overflow = "auto";
}

window.closeVideo = function() { 
    if (window.history.state && window.history.state.modalOpen === "video") window.history.back();
    else closeVideoLogic();
};

window.closePdfModal = function() { 
    if (window.history.state && window.history.state.modalOpen === "pdf") window.history.back();
    else closePdfLogic();
};

window.logoutUser = function() { auth.signOut().then(() => { window.location.href = "logout_success.html"; }); };
window.closeLoginPopup = function() { document.getElementById('loginAlertModal').style.display = 'none'; };
