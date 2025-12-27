// --- THRIPUDI LIBRARY MASTER SCRIPT (V6 - STABLE BACK & MASK FIXED) ---

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

// 1. മ്യൂസിക് സിസ്റ്റം ഇൻജക്ട് ചെയ്യുന്നു
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mpeg" type="audio/mpeg"></audio>`;
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
    setTimeout(() => clearInterval(navSearch), 5000);
}

window.toggleBGMusic = function() {
    const musicIcon = document.getElementById("music-icon");
    if (!bgMusic) bgMusic = document.getElementById("bgMusic");
    if (bgMusic.paused) {
        bgMusic.play().then(() => { if(musicIcon) musicIcon.className = "fas fa-volume-up"; }).catch(e => console.log("User Interaction Needed"));
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

// 2. ആക്സസ് & ബാക്ക് ബട്ടൺ ലോജിക്
window.checkAccess = function(id, type, cardId) {
    if (auth && !auth.currentUser) {
        if(document.getElementById('loginAlertModal')) document.getElementById('loginAlertModal').style.display = 'flex';
        return;
    }

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
        document.getElementById('player-' + id).innerHTML = `<div class="player-mask" style="width:100px; height:50px; position:absolute; top:0; right:0; z-index:10;"></div><iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;"></iframe>`;
    } else if (type === 'video') {
        // ഹിസ്റ്ററി പുഷ് (മൊബൈൽ ബാക്ക് ബട്ടണിനായി)
        window.history.pushState({modalOpen: "video"}, ""); 
        
        // വീഡിയോ പ്ലെയർ മാസ്ക് സഹിതം തുറക്കുന്നു
        document.getElementById('videoFrameContainer').innerHTML = `
            <div class="player-mask" style="width:60px; height:60px; position:absolute; top:0; right:0; z-index:100;"></div>
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

// മൊബൈൽ ബാക്ക് ബട്ടൺ തിരിച്ചറിയുന്നു
window.onpopstate = function(event) {
    if (document.getElementById('videoOverlay').style.display === 'flex') {
        closeVideoLogic();
    } else if (document.getElementById('pdfModal').style.display === 'flex') {
        closePdfLogic();
    }
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
    if (window.history.state && window.history.state.modalOpen === "video") {
        window.history.back(); // ഇത് onpopstate വഴി closeVideoLogic വിളിക്കും
    } else {
        closeVideoLogic();
    }
};

window.closePdfModal = function() {
    if (window.history.state && window.history.state.modalOpen === "pdf") {
        window.history.back();
    } else {
        closePdfLogic();
    }
};

window.logoutUser = () => auth.signOut().then(() => window.location.href = "logout_success.html");
window.closeLoginPopup = () => document.getElementById('loginAlertModal').style.display = 'none';
