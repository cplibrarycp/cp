// --- THRIPUDI LIBRARY MASTER SCRIPT ---

const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

// Firebase Initialize (Namespace Version 8)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
let currentAudioId = null;
let bgMusic;

// --- 1. മ്യൂസിക് സിസ്റ്റം ഇൻജക്ട് ചെയ്യുന്നു ---
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;

    // ഓഡിയോ ടാഗ് ബോഡിയുടെ തുടക്കത്തിൽ ചേർക്കുന്നു
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mpeg" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2; // 20% വോളിയം

    // ഹെഡർ മെനുവിൽ മ്യൂസിക് ബട്ടൺ ചേർക്കുന്നു (ഹോമിന് മുൻപായി)
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.navbar') || document.querySelector('.container.navbar');
    if (navLinks && !document.getElementById('music-nav-item')) {
        const musicBtnHTML = `
            <a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; display:inline-flex; align-items:center; gap:5px;">
                <i id="music-icon" class="fas fa-volume-mute"></i> Music
            </a>
        `;
        navLinks.insertAdjacentHTML('afterbegin', musicBtnHTML);
    }
}

// മ്യൂസിക് ഓൺ/ഓഫ് ടോഗിൾ
window.toggleBGMusic = function() {
    const musicIcon = document.getElementById("music-icon");
    if (!bgMusic) bgMusic = document.getElementById("bgMusic");
    
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("User Interaction Required"));
        if(musicIcon) {
            musicIcon.className = "fas fa-volume-up";
            musicIcon.parentElement.style.color = "#00897B";
        }
    } else {
        bgMusic.pause();
        if(musicIcon) {
            musicIcon.className = "fas fa-volume-mute";
            musicIcon.parentElement.style.color = "inherit";
        }
    }
};

// --- 2. പേജ് ലോഡ് ആകുമ്പോൾ പ്രവർത്തിക്കേണ്ടവ ---
document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();

    // പ്രൊഫൈൽ & ഡ്രോപ്പ്ഡൗൺ ലോജിക്
    const userAvatarImg = document.getElementById('user-avatar-img');
    const defaultUserImg = 'assets/cover/default_user.jpg';
    const dName = document.getElementById('display-name');

    auth.onAuthStateChanged(user => {
        if (user) {
            if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
            if(userAvatarImg) userAvatarImg.src = user.photoURL ? user.photoURL : defaultUserImg;
        } else {
            if(userAvatarImg) userAvatarImg.src = defaultUserImg;
            if(dName) dName.innerText = "അതിഥി";
        }
    });

    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        });
    }
    window.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });

    // ആദ്യ ക്ലിക്കിൽ മ്യൂസിക് തുടങ്ങാൻ (Browser Policy)
    document.body.addEventListener('click', () => {
        const mIcon = document.getElementById('music-icon');
        if (bgMusic && bgMusic.paused && mIcon && mIcon.classList.contains("fa-volume-up")) {
            bgMusic.play();
        }
    }, { once: true });
});

// --- 3. പ്രധാന ആക്സസ് ലോജിക് (PDF, Audio, Video) ---
window.checkAccess = function(id, type, cardId) {
    if (!auth.currentUser) {
        let msg = "തുടരാനായി ലോഗിൻ ചെയ്യുക";
        if(document.getElementById('loginMsg')) document.getElementById('loginMsg').innerText = msg;
        if(document.getElementById('loginAlertModal')) {
            document.getElementById('loginAlertModal').style.display = 'flex';
            document.getElementById('loginAlertModal').style.setProperty('display', 'flex', 'important');
        }
    } else {
        const cardElement = document.getElementById(cardId);
        const bName = cardElement.querySelector('.book-title').innerText;
        const bThumb = cardElement.querySelector('.book-cover').src;
        
        // ഹിസ്റ്ററി സേവ് ചെയ്യുന്നു
        let history = JSON.parse(localStorage.getItem('thripudi_history_' + auth.currentUser.uid)) || [];
        history = history.filter(item => item.id !== id);
        history.push({ id: id, name: bName, thumb: bThumb, date: new Date().toLocaleDateString('ml-IN') });
        if (history.length > 20) history.shift();
        localStorage.setItem('thripudi_history_' + auth.currentUser.uid, JSON.stringify(history));

        // ഓഡിയോ/വീഡിയോ ആണെങ്കിൽ മ്യൂസിക് താത്കാലികമായി നിർത്തുന്നു
        if (type !== 'pdf' && bgMusic) {
            bgMusic.pause();
        }

        if (type === 'audio') {
            if (currentAudioId && currentAudioId !== id) {
                const prevPlayer = document.getElementById('player-' + currentAudioId);
                if(prevPlayer) prevPlayer.innerHTML = "";
            }
            document.getElementById('player-' + id).innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;"></iframe>`;
            currentAudioId = id;
        } else if (type === 'video') {
            // ബാക്ക് ബട്ടൺ ലോജിക് തുടങ്ങുന്നു
            window.history.pushState({playerOpen: true}, "");
            document.getElementById('videoFrameContainer').innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;" allow="autoplay"></iframe>`;
            document.getElementById('videoOverlay').style.display = 'flex';
            document.body.style.overflow = "hidden";
        } else {
            // PDF - മ്യൂസിക് പ്ലേ ആയിക്കൊണ്ടിരിക്കും
            window.history.pushState({pdfOpen: true}, "");
            document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview?rm=minimal`;
            document.getElementById('pdfModal').style.display = 'flex';
            document.body.style.overflow = "hidden";
        }
    }
};

// --- 4. മൊബൈൽ ബാക്ക് ബട്ടൺ ലോജിക് ---
window.onpopstate = function(event) {
    const videoOverlay = document.getElementById('videoOverlay');
    const pdfModal = document.getElementById('pdfModal');
    
    if (videoOverlay && videoOverlay.style.display === 'flex') {
        closeVideoLogic();
    } else if (pdfModal && pdfModal.style.display === 'flex') {
        closePdfLogic();
    }
};

function closeVideoLogic() {
    const v = document.getElementById('videoOverlay');
    if(v) v.style.display = 'none';
    const container = document.getElementById('videoFrameContainer');
    if(container) container.innerHTML = "";
    document.body.style.overflow = "auto";
    // മ്യൂസിക് നേരത്തെ ഓൺ ആയിരുന്നുവെങ്കിൽ വീണ്ടും തുടങ്ങുന്നു
    const mIcon = document.getElementById("music-icon");
    if (bgMusic && mIcon && mIcon.classList.contains("fa-volume-up")) bgMusic.play();
}

function closePdfLogic() {
    const p = document.getElementById('pdfModal');
    if(p) p.style.display = 'none';
    const f = document.getElementById('pdfFrame');
    if(f) f.src = "";
    document.body.style.overflow = "auto";
}

// HTML-ലെ ക്ലോസ് ബട്ടണുകൾ വിളിക്കേണ്ട ഫങ്ക്ഷനുകൾ
window.closeVideo = function() { 
    closeVideoLogic();
    if (window.history.state && window.history.state.playerOpen) window.history.back();
};

window.closePdfModal = function() { 
    closePdfLogic();
    if (window.history.state && window.history.state.pdfOpen) window.history.back();
};

window.logoutUser = function() { auth.signOut().then(() => { window.location.href = "logout_success.html"; }); };
window.closeLoginPopup = function() { if(document.getElementById('loginAlertModal')) document.getElementById('loginAlertModal').style.display = 'none'; };