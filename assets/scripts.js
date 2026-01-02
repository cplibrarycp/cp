/* Project Logic - Thripudi Master Template Scripts
   Final Fix: Centered Audio, Masked PDF Header Fix, Profile Dropdown & Video Pop-out Mask
*/

const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
let bgMusic;

// Inject Background Music and Header Buttons
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mp3" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2;

    const navSearch = setInterval(() => {
        const userProfileBtn = document.getElementById('user-profile-btn');
        const navItems = document.querySelectorAll('.nav-item, .nav-btn');
        
        let homeBtn = Array.from(navItems).find(item => 
            item.innerText.trim() === 'Home' || item.getAttribute('href') === 'dashboard.html'
        );

        if (homeBtn && !document.getElementById('music-nav-item')) {
            const musicBtnHTML = `<a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin-right:10px;"><i id="music-icon" class="fas fa-volume-mute"></i> Music</a>`;
            homeBtn.insertAdjacentHTML('beforebegin', musicBtnHTML);
        }

        if (userProfileBtn && !document.getElementById('exit-header-btn') && (window.AppInventor || /Android/i.test(navigator.userAgent))) {
            const exitBtnHTML = `<i id="exit-header-btn" class="fa fa-power-off" style="font-size: 1.3rem; margin-left: 15px; cursor: pointer; color: #ff4444; vertical-align: middle;" onclick="window.forceExit()"></i>`;
            userProfileBtn.insertAdjacentHTML('afterend', exitBtnHTML);
        }
        if (document.getElementById('music-nav-item')) clearInterval(navSearch);
    }, 500);
}

// Background Music Toggle
window.toggleBGMusic = function() {
    const icon = document.getElementById("music-icon");
    if (!bgMusic) bgMusic = document.getElementById("bgMusic");
    if (bgMusic.paused) {
        bgMusic.play().then(() => { if(icon) icon.className = "fas fa-volume-up"; });
    } else {
        bgMusic.pause();
        if(icon) icon.className = "fas fa-volume-mute";
    }
};

// Auth and Profile Logic
document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();
    const userAvatarImg = document.getElementById('user-avatar-img');
    const dName = document.getElementById('display-name');
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
                if(userAvatarImg) userAvatarImg.src = user.photoURL || 'assets/cover/default_user.jpg';
            } else {
                if(dName) dName.innerText = "അതിഥി";
                if(userAvatarImg) userAvatarImg.src = 'assets/cover/default_user.jpg';
            }
        });
    }

    if (profileBtn) {
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            if(dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        };
    }
    window.onclick = () => { if(dropdown) dropdown.style.display = 'none'; };
});

// Access and Player Logic
window.checkAccess = function(id, type, cardId) {
    if (!auth || !auth.currentUser) {
        localStorage.setItem('return_to', window.location.href);
        const modal = document.getElementById('loginAlertModal');
        if(modal) modal.style.setProperty('display', 'flex', 'important');
        return;
    }

    const cardElement = document.getElementById(cardId);
    const bName = (cardElement.querySelector('.book-title, h6')).innerText;
    const bThumb = (cardElement.querySelector('.book-cover, img')).src;
    const uid = auth.currentUser.uid;

    let history = JSON.parse(localStorage.getItem('thripudi_history_' + uid)) || [];
    history = history.filter(item => item.id !== id);
    history.push({ id, name: bName, thumb: bThumb, date: new Date().toLocaleDateString('ml-IN') });
    localStorage.setItem('thripudi_history_' + uid, JSON.stringify(history.slice(-20)));

    if(type !== 'pdf' && bgMusic) bgMusic.pause();

    if (type === 'audio') {
        document.querySelectorAll('.audio-player-box').forEach(box => { box.innerHTML = ""; box.style.display = "none"; });
        document.querySelectorAll('.book-card').forEach(card => card.classList.remove('audio-active'));
        
        const playerBox = document.getElementById('player-' + id);
        if (playerBox) {
            playerBox.style.display = "flex";
            playerBox.style.position = "absolute";
            playerBox.style.top = "0"; playerBox.style.left = "0";
            playerBox.style.width = "100%"; playerBox.style.height = "100%";
            playerBox.style.backgroundColor = "rgba(0,0,0,0.7)";
            playerBox.style.flexDirection = "column";
            playerBox.style.justifyContent = "center";
            playerBox.style.alignItems = "center";
            playerBox.style.zIndex = "10";
            playerBox.style.borderRadius = "inherit";

            playerBox.innerHTML = `
                <div class="audio-masked-wrapper" style="width: 55px; height: 55px; overflow: hidden; border-radius: 50%; border: 3px solid #FFD700; position: relative; background: white; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);">
                    <iframe src="https://drive.google.com/file/d/${id}/preview" 
                        style="position: absolute; top: -120px; left: -14px; width: 300px; height: 300px; border: none; pointer-events: all;">
                    </iframe>
                </div>
                <p style="font-size:0.65em; color:white; margin: 8px 0; font-weight:bold; letter-spacing:1px; text-shadow: 1px 1px 2px black;">PLAY</p>
                <i class="fas fa-times-circle" style="font-size:1.8em; cursor:pointer; color:#FFD700;" onclick="window.stopAudio('${id}', '${cardId}')"></i>
            `;
        }
        document.getElementById(cardId).classList.add('audio-active');
    } else if (type === 'video') {
        window.history.pushState({modalOpen: "video"}, ""); 
        // Video Pop-out Mask: ഐഫ്രെയിമിന് മുകളിൽ ഒരു മാസ്കിംഗ് ഡിവ് ചേർക്കുന്നു
        document.getElementById('videoFrameContainer').innerHTML = `
            <button onclick="window.closeVideo()" style="position:absolute; top:15px; left:15px; z-index:1005; background:white; border:none; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.5); cursor:pointer;"><i class="fas fa-arrow-left" style="color:#333; font-size:20px;"></i></button>
            <div class="video-popout-mask" style="position:absolute; top:0; right:0; width:80px; height:60px; z-index:1002; background:transparent;"></div>
            <iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%; height:100%; border:none;" allow="autoplay"></iframe>
        `;
        document.getElementById('videoOverlay').style.display = 'flex';
    } else if (type === 'pdf') {
        window.history.pushState({modalOpen: "pdf"}, "");
        const frame = document.getElementById('pdfFrame');
        const modalTitle = document.getElementById('modalBookTitle');
        if(modalTitle) modalTitle.innerText = bName;

        const pdfBodyContainer = document.querySelector('.pdf-mask-container') || frame.parentElement;
        if (pdfBodyContainer) {
            pdfBodyContainer.style.overflow = "hidden";
            pdfBodyContainer.style.position = "relative";
            frame.style.position = "absolute";
            frame.style.top = "-50px"; 
            frame.style.width = "100%";
            frame.style.height = "calc(100% + 50px)";
        }
        frame.src = `https://drive.google.com/file/d/${id}/preview?rm=minimal`;
        document.getElementById('pdfModal').style.display = 'flex';
    }
};

window.stopAudio = function(id, cardId) {
    const playerBox = document.getElementById('player-' + id);
    if (playerBox) { playerBox.innerHTML = ""; playerBox.style.display = "none"; }
    const card = document.getElementById(cardId);
    if (card) card.classList.remove('audio-active');
};

window.closeVideo = () => { document.getElementById('videoOverlay').style.display = 'none'; document.getElementById('videoFrameContainer').innerHTML = ""; };
window.closePdfModal = () => { document.getElementById('pdfModal').style.display = 'none'; document.getElementById('pdfFrame').src = ""; };

window.logoutUser = () => { if(auth) auth.signOut().then(() => { window.location.href = "logout_success.html"; }); };
window.forceExit = function() { document.getElementById('exitModal').style.display = 'flex'; };

// Firebase Sync and Popstate
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user && !sessionStorage.getItem('synced_' + user.uid)) {
            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyQJiEMzmOm6-jnY3sOZnw9_wO_jwCxi-vfR-ko15mY4t-hev3w8ABerI-ppK7GvDTrg/exec";
            let formData = new FormData();
            formData.append("action", "saveProfile");
            formData.append("email", user.email);
            formData.append("name", user.displayName || user.email.split('@')[0]);
            fetch(SCRIPT_URL, { method: 'POST', body: formData, mode: 'no-cors' })
            .then(() => sessionStorage.setItem('synced_' + user.uid, 'true'));
        }
    });
}
window.onpopstate = function() { window.closeVideo(); window.closePdfModal(); };
