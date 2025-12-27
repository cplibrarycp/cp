// --- THRIPUDI LIBRARY MASTER SCRIPT (V10 - MUSIC & VIDEO FIXED) ---

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

// 1. മ്യൂസിക് സിസ്റ്റം
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mp3" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2;

    const navSearch = setInterval(() => {
        const navLinks = document.querySelector('.nav-links') || document.querySelector('.navbar') || document.querySelector('header .container');
        if (navLinks && !document.getElementById('music-nav-item')) {
            const musicBtnHTML = `<a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin-right:10px;"><i id="music-icon" class="fas fa-volume-mute"></i> Music</a>`;
            navLinks.insertAdjacentHTML('afterbegin', musicBtnHTML);
            clearInterval(navSearch);
        }
    }, 100);
}

window.toggleBGMusic = function() {
    const musicIcon = document.getElementById("music-icon");
    if (!bgMusic) bgMusic = document.getElementById("bgMusic");
    
    if (bgMusic.paused) {
        bgMusic.play();
        if(musicIcon) musicIcon.className = "fas fa-volume-up";
    } else {
        bgMusic.pause();
        if(musicIcon) musicIcon.className = "fas fa-volume-mute";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();
    setupProfileDropdown();
    if (auth) {
        auth.onAuthStateChanged(user => {
            const dName = document.getElementById('display-name');
            const userAvatarImg = document.getElementById('user-avatar-img');
            if (user) {
                if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
                if(userAvatarImg) userAvatarImg.src = user.photoURL || 'assets/cover/default_user.jpg';
            } else {
                if(dName) dName.innerText = "അതിഥി";
                if(userAvatarImg) userAvatarImg.src = 'assets/cover/default_user.jpg';
            }
        });
    }
});

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
window.onclick = () => { if(document.getElementById('profile-dropdown')) document.getElementById('profile-dropdown').style.display = 'none'; };

// 2. ആക്സസ് & പ്ലെയർ ലോജിക്
window.checkAccess = function(id, type, cardId) {
    if (auth && !auth.currentUser) {
        if(document.getElementById('loginAlertModal')) document.getElementById('loginAlertModal').style.display = 'flex';
        return;
    }

    // ഹിസ്റ്ററി സേവിംഗ്
    const card = document.getElementById(cardId);
    if (card && auth.currentUser) {
        const title = card.querySelector('.book-title').innerText;
        const img = card.querySelector('.book-cover').src;
        let history = JSON.parse(localStorage.getItem('thripudi_history_' + auth.currentUser.uid)) || [];
        history = history.filter(item => item.id !== id);
        history.push({ id, name: title, thumb: img, date: new Date().toLocaleDateString('ml-IN') });
        localStorage.setItem('thripudi_history_' + auth.currentUser.uid, JSON.stringify(history.slice(-20)));
    }

    if(type !== 'pdf' && bgMusic) bgMusic.pause();

    if (type === 'audio') {
        document.getElementById('player-' + id).innerHTML = `<div style="width:100px; height:50px; position:absolute; top:0; right:0; z-index:99999;"></div><iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;"></iframe>`;
    } else if (type === 'video') {
        window.history.pushState({modalOpen: "video"}, ""); 
        document.getElementById('videoFrameContainer').innerHTML = `
            <div class="player-mask" style="width:70px; height:70px; position:absolute; top:0; right:0; z-index:99999; background:transparent;"></div>
            <button onclick="window.closeVideo()" style="position:absolute; top:15px; left:15px; z-index:100000; background:white; border:none; border-radius:50%; width:35px; height:35px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.5); cursor:pointer;">
                <i class="fas fa-arrow-left" style="color:#333; font-size:18px;"></i>
            </button>
            <iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;" allow="autoplay"></iframe>
        `;
        document.getElementById('videoOverlay').style.display = 'flex';
        document.body.style.overflow = "hidden";
    } else if (type === 'pdf') {
        window.history.pushState({modalOpen: "pdf"}, "");
        document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview`;
        document.getElementById('pdfModal').style.display = 'flex';
        document.body.style.overflow = "hidden";
    }
};

window.onpopstate = function() {
    if (document.getElementById('videoOverlay').style.display === 'flex') closeVideoLogic();
    else if (document.getElementById('pdfModal').style.display === 'flex') closePdfLogic();
};

function closeVideoLogic() {
    document.getElementById('videoOverlay').style.display = 'none';
    document.getElementById('videoFrameContainer').innerHTML = "";
    document.body.style.overflow = "auto";
    const mIcon = document.getElementById("music-icon");
    if (bgMusic && mIcon && mIcon.classList.contains("fa-volume-up")) bgMusic.play();
}

function closePdfLogic() {
    document.getElementById('pdfModal').style.display = 'none';
    document.getElementById('pdfFrame').src = "";
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

window.logoutUser = () => auth.signOut().then(() => window.location.href = "logout_success.html");
window.closeLoginPopup = () => document.getElementById('loginAlertModal').style.display = 'none';
