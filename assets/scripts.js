// --- THRIPUDI LIBRARY MASTER SCRIPT (V2 - UNIVERSAL INJECTION) ---

const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

// Firebase Initialize
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
let currentAudioId = null;
let bgMusic;

// --- 1. മ്യൂസിക് സിസ്റ്റം ഇൻജക്ട് ചെയ്യുന്നു ---
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;

    // ഓഡിയോ ടാഗ് നിർമ്മിക്കുന്നു
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mpeg" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2;

    // ഹെഡറിൽ മെനു കണ്ടെത്താനുള്ള തീവ്രശ്രമം
    const findHeaderAndInject = setInterval(() => {
        // ഹെഡറിലെ ലിങ്കുകൾ വരാൻ സാധ്യതയുള്ള എല്ലാ ക്ലാസ്സുകളും നോക്കുന്നു
        const navLinks = document.querySelector('.nav-links') || 
                         document.querySelector('.navbar') || 
                         document.querySelector('.container.navbar') ||
                         document.querySelector('header .container');

        if (navLinks && !document.getElementById('music-nav-item')) {
            const musicBtnHTML = `
                <a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin-right:10px;">
                    <i id="music-icon" class="fas fa-volume-mute"></i> Music
                </a>
            `;
            // ഹോം ബട്ടണിന് മുമ്പിലായി ചേർക്കുന്നു
            navLinks.insertAdjacentHTML('afterbegin', musicBtnHTML);
            clearInterval(findHeaderAndInject); // ബട്ടൺ ചേർത്തു കഴിഞ്ഞാൽ തിരച്ചിൽ നിർത്തുക
        }
    }, 500); // ഓരോ അര സെക്കന്റിലും ഹെഡർ ഉണ്ടോ എന്ന് പരിശോധിക്കും

    // 5 സെക്കന്റ് കഴിഞ്ഞിട്ടും ഹെഡർ കണ്ടില്ലെങ്കിൽ പരിശോധന നിർത്തുക
    setTimeout(() => clearInterval(findHeaderAndInject), 5000);
}

// മ്യൂസിക് ടോഗിൾ
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

document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();

    // പ്രൊഫൈൽ ഭാഗം
    const userAvatarImg = document.getElementById('user-avatar-img');
    const dName = document.getElementById('display-name');
    const defaultUserImg = 'assets/cover/default_user.jpg';

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
                if(userAvatarImg) userAvatarImg.src = user.photoURL ? user.photoURL : defaultUserImg;
            } else {
                if(userAvatarImg) userAvatarImg.src = defaultUserImg;
                if(dName) dName.innerText = "അതിഥി";
            }
        });
    }

    // പ്രൊഫൈൽ ഡ്രോപ്പ്ഡൗൺ
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileBtn) {
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            if(dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        };
    }
    window.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });
});

// --- 3. ആക്സസ് ലോജിക് (ബാക്ക് ബട്ടൺ ഉൾപ്പെടെ) ---
window.checkAccess = function(id, type, cardId) {
    if (auth && !auth.currentUser) {
        if(document.getElementById('loginAlertModal')) document.getElementById('loginAlertModal').style.display = 'flex';
    } else {
        const cardElement = document.getElementById(cardId);
        const bName = cardElement ? cardElement.querySelector('.book-title').innerText : "Book";
        const bThumb = cardElement ? cardElement.querySelector('.book-cover').src : "";
        
        // ഹിസ്റ്ററി
        if(auth && auth.currentUser) {
            let history = JSON.parse(localStorage.getItem('thripudi_history_' + auth.currentUser.uid)) || [];
            history = history.filter(item => item.id !== id);
            history.push({ id: id, name: bName, thumb: bThumb, date: new Date().toLocaleDateString('ml-IN') });
            localStorage.setItem('thripudi_history_' + auth.currentUser.uid, JSON.stringify(history.slice(-20)));
        }

        // വീഡിയോ/ഓഡിയോ ആണെങ്കിൽ മ്യൂസിക് നിർത്തുക
        if (type !== 'pdf' && bgMusic) bgMusic.pause();

        if (type === 'audio') {
            if (currentAudioId) document.getElementById('player-' + currentAudioId).innerHTML = "";
            document.getElementById('player-' + id).innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;"></iframe>`;
            currentAudioId = id;
        } else if (type === 'video') {
            window.history.pushState({playerOpen: true}, "");
            document.getElementById('videoFrameContainer').innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%;height:100%;border:none;" allow="autoplay"></iframe>`;
            document.getElementById('videoOverlay').style.display = 'flex';
            document.body.style.overflow = "hidden";
        } else {
            window.history.pushState({pdfOpen: true}, "");
            document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview`;
            document.getElementById('pdfModal').style.display = 'flex';
            document.body.style.overflow = "hidden";
        }
    }
};

window.onpopstate = function() {
    closeVideoLogic();
    closePdfLogic();
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
    closeVideoLogic();
    if (window.history.state && window.history.state.playerOpen) window.history.back();
};

window.closePdfModal = function() { 
    closePdfLogic();
    if (window.history.state && window.history.state.pdfOpen) window.history.back();
};

window.logoutUser = function() { auth.signOut().then(() => { window.location.href = "logout_success.html"; }); };
window.closeLoginPopup = function() { document.getElementById('loginAlertModal').style.display = 'none'; };