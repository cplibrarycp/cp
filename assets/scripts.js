const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

// Firebase 8 Initialize
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
let currentAudioId = null;
let bgMusic;

// 1. മ്യൂസിക് സിസ്റ്റം & ഹെഡർ ടൂൾസ്
function injectMusicSystem() {
    if (document.getElementById('bgMusic')) return;
    const audioHTML = `<audio id="bgMusic" loop preload="auto"><source src="assets/cover/bg.mp3" type="audio/mpeg"></audio>`;
    document.body.insertAdjacentHTML('afterbegin', audioHTML);
    bgMusic = document.getElementById("bgMusic");
    if (bgMusic) bgMusic.volume = 0.2;

    const navSearch = setInterval(() => {
        const navItems = document.querySelectorAll('.nav-item, .nav-btn');
        const navLinksGroup = document.querySelector('.nav-links-group') || document.querySelector('.nav-links');
        const searchIcon = document.querySelector('.fa-search');
        
        let homeBtn = Array.from(navItems).find(item => item.innerText.trim() === 'Home' || item.getAttribute('href') === 'dashboard.html' || item.innerText.trim() === 'Dashboard');

        if (homeBtn && !document.getElementById('music-nav-item')) {
            const musicBtnHTML = `<a class="nav-item" id="music-nav-item" href="javascript:void(0)" onclick="toggleBGMusic()" style="font-weight:bold; color:#004D40; cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin-right:10px;"><i id="music-icon" class="fas fa-volume-mute"></i> Music</a>`;
            homeBtn.insertAdjacentHTML('beforebegin', musicBtnHTML);
        }

        if (navLinksGroup && !document.getElementById('exit-header-btn') && (window.AppInventor || /Android/i.test(navigator.userAgent))) {
            const exitBtnHTML = `<i id="exit-header-btn" class="fa fa-power-off" style="font-size: 1.3rem; margin-left: 15px; cursor: pointer; color: #ff4444;" onclick="window.forceExit()"></i>`;
            if (searchIcon) {
                searchIcon.insertAdjacentHTML('afterend', exitBtnHTML);
            } else {
                navLinksGroup.insertAdjacentHTML('beforeend', exitBtnHTML);
            }
        }

        if (document.getElementById('music-nav-item')) clearInterval(navSearch);
    }, 500);
}

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

// 2. യൂസർ സ്റ്റേറ്റ് & റീഡയറക്ട് (തിരുത്തിയത് ഇവിടെയാണ്)
document.addEventListener('DOMContentLoaded', () => {
    injectMusicSystem();
    const userAvatarImg = document.getElementById('user-avatar-img');
    const dName = document.getElementById('display-name');

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                if(dName) dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
                if(userAvatarImg) userAvatarImg.src = user.photoURL || 'assets/cover/default_user.jpg';

                // റീഡയറക്ട് ലോജിക് - ലോഗിൻ പേജിലാണെങ്കിൽ മാത്രം പ്രവർത്തിക്കുന്നു
                const path = window.location.pathname;
                const isLoginPage = path.endsWith('login.html') || path.endsWith('index.html') || path === '/' || path.split('/').pop() === '';
                
                if (isLoginPage) {
                    // Firebase state ഉറപ്പിക്കാൻ ഒരു ചെറിയ ഡിലേ നൽകുന്നു
                    setTimeout(() => {
                        const returnUrl = localStorage.getItem('return_to');
                        if (returnUrl && !returnUrl.includes('login.html')) {
                            localStorage.removeItem('return_to');
                            window.location.href = returnUrl;
                        }
                    }, 800);
                }
            } else {
                if(dName) dName.innerText = "അതിഥി";
                if(userAvatarImg) userAvatarImg.src = 'assets/cover/default_user.jpg';
            }
        });
    }

    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileBtn) {
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            if(dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        };
    }
    window.onclick = () => { if(dropdown) dropdown.style.display = 'none'; };
});

// 3. ആക്സസ് & ഹിസ്റ്ററി
window.checkAccess = function(id, type, cardId) {
    if (!auth || !auth.currentUser) {
        localStorage.setItem('return_to', window.location.href);
        document.getElementById('loginAlertModal').style.setProperty('display', 'flex', 'important');
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
        document.getElementById('player-' + id).innerHTML = `<div class="player-mask" style="width:80px;height:50px;position:absolute;z-index:9;"></div><iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;" scrolling="no"></iframe>`;
        document.getElementById(cardId).classList.add('audio-active');
    } else if (type === 'video') {
        window.history.pushState({modalOpen: "video"}, ""); 
        document.getElementById('videoFrameContainer').innerHTML = `<button onclick="window.closeVideo()" style="position:absolute; top:15px; left:15px; z-index:1000; background:white; border:none; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.5); cursor:pointer;"><i class="fas fa-arrow-left" style="color:#333; font-size:20px;"></i></button><iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;" allow="autoplay"></iframe>`;
        document.getElementById('videoOverlay').style.display = 'flex';
    } else if (type === 'pdf') {
        window.history.pushState({modalOpen: "pdf"}, "");
        document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview?rm=minimal`;
        document.getElementById('pdfModal').style.display = 'flex';
    }
};

// 4. എക്സിറ്റ് ലോജിക്
function confirmAppExit() {
    if (window.AppInventor) { window.AppInventor.setWebViewString("close"); }
    else { document.getElementById('exitModal').style.display = 'none'; }
}

window.forceExit = function() {
    if (!document.getElementById('exitModal')) {
        const modalHTML = `<div id="exitModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:200000; justify-content:center; align-items:center;"><div style="background:white; width:85%; max-width:320px; border-radius:15px; overflow:hidden; text-align:center;"><div style="background:#004D40; padding:15px; color:white;"><img src="assets/cover/logo.png" style="width:30px; margin-right:10px;"><b>THRIPUDI</b></div><div style="padding:20px; color:black; font-weight:bold;">പുറത്ത് കടക്കണോ?</div><div style="display:flex; border-top:1px solid #eee;"><button onclick="document.getElementById('exitModal').style.display='none'" style="flex:1; padding:15px; border:none; background:none; cursor:pointer;">അല്ല</button><button onclick="confirmAppExit()" style="flex:1; padding:15px; border:none; background:none; color:#ff4444; font-weight:bold; cursor:pointer;">അതെ</button></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    document.getElementById('exitModal').style.display = 'flex';
};

window.logoutUser = () => { if(auth) auth.signOut().then(() => { window.location.href = "logout_success.html"; }); };
window.closeLoginPopup = () => { document.getElementById('loginAlertModal').style.display = 'none'; };
window.closeVideo = () => { document.getElementById('videoOverlay').style.display = 'none'; document.getElementById('videoFrameContainer').innerHTML = ""; };
window.closePdfModal = () => { document.getElementById('pdfModal').style.display = 'none'; document.getElementById('pdfFrame').src = ""; };
window.onpopstate = function() { window.closeVideo(); window.closePdfModal(); };
