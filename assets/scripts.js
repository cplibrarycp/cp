const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let bgMusic;
let activeAudioCard = null;

// മ്യൂസിക് ഇഞ്ചക്ഷൻ
function injectMusic() {
    if (document.getElementById('bgMusic')) return;
    document.body.insertAdjacentHTML('afterbegin', `<audio id="bgMusic" loop><source src="assets/cover/bg.mp3" type="audio/mpeg"></audio>`);
    bgMusic = document.getElementById("bgMusic");
    const nav = document.querySelector('.nav-links');
    if (nav) nav.insertAdjacentHTML('afterbegin', `<a class="nav-item" href="javascript:void(0)" onclick="toggleMusic()"><i id="m-icon" class="fas fa-volume-mute"></i> Music</a>`);
}

window.toggleMusic = function() {
    const icon = document.getElementById("m-icon");
    if (bgMusic.paused) { bgMusic.play(); icon.className = "fas fa-volume-up"; } 
    else { bgMusic.pause(); icon.className = "fas fa-volume-mute"; }
};

// പുസ്തകങ്ങൾ JSON-ൽ നിന്ന് ലോഡ് ചെയ്യുന്നു (രാവിലെ ചെയ്ത പൈത്തൺ ലോജിക് അനുസരിച്ച്)
async function loadBooks() {
    try {
        const response = await fetch('assets/library_data.json'); // രാവിലെ ഉണ്ടാക്കിയ JSON
        const data = await response.json();
        const container = document.querySelector('.library-container');
        if (!container) return;

        container.innerHTML = data.books.map(book => `
            <div class="book-card" id="card-${book.id}">
                <div class="image-wrapper">
                    <img class="book-cover" src="${book.cover}">
                    <div class="read-overlay">
                        <button class="overlay-btn" onclick="checkAccess('${book.id}', '${book.type}', 'card-${book.id}')">
                            ${book.type === 'pdf' ? 'വായിക്കാം' : (book.type === 'video' ? 'കാണാം' : 'കേൾക്കാം')}
                        </button>
                    </div>
                    <div class="audio-player-box" id="player-${book.id}"></div>
                </div>
                <div class="book-title">${book.title}</div>
            </div>
        `).join('');
    } catch (e) { console.error("JSON ലോഡ് ചെയ്യുന്നതിൽ പരാജയം", e); }
}

document.addEventListener('DOMContentLoaded', () => {
    injectMusic();
    loadBooks(); // പുസ്തകങ്ങൾ ലോഡ് ചെയ്യുന്നു
    
    // പ്രൊഫൈൽ ലോജിക്
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('display-name').innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
            document.getElementById('user-avatar-img').src = user.photoURL || 'assets/cover/default_user.jpg';
        }
    });

    const profBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    if (profBtn) profBtn.onclick = (e) => { e.stopPropagation(); dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block'; };
    document.onclick = () => { if(dropdown) dropdown.style.display = 'none'; };
});

window.checkAccess = function(id, type, cardId) {
    if (!auth.currentUser) {
        document.getElementById('loginMsg').innerText = "ഈ പുസ്തകം ലഭിക്കാൻ ലോഗിൻ ചെയ്യൂ";
        document.getElementById('loginAlertModal').style.display = 'flex';
        return;
    }

    if(type !== 'pdf' && bgMusic) bgMusic.pause();

    if (type === 'audio') {
        if (activeAudioCard && activeAudioCard !== cardId) {
            document.getElementById(activeAudioCard).classList.remove('audio-active');
            document.getElementById('player-' + activeAudioCard.replace('card-','')).innerHTML = '';
        }
        const player = document.getElementById('player-' + id);
        player.innerHTML = `<div class="player-mask" style="position:absolute;top:0;right:0;width:100px;height:100%;z-index:20;"></div><iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%; height:100%; border:none;"></iframe>`;
        document.getElementById(cardId).classList.add('audio-active');
        activeAudioCard = cardId;
    } else if (type === 'pdf') {
        const modal = document.getElementById('pdfModal');
        document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview`;
        modal.style.display = 'flex';
    } else if (type === 'video') {
        const vFrame = document.getElementById('videoFrameContainer');
        vFrame.innerHTML = `<div class="player-mask" style="position:absolute;top:0;right:0;width:100px;height:80px;z-index:20;"></div><iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%; height:100%; border:none;" allow="autoplay"></iframe>`;
        document.getElementById('videoOverlay').style.display = 'flex';
    }
};

window.closePdfModal = () => { document.getElementById('pdfModal').style.display = 'none'; document.getElementById('pdfFrame').src = ""; };
window.closeVideo = () => { document.getElementById('videoOverlay').style.display = 'none'; document.getElementById('videoFrameContainer').innerHTML = ""; };
window.closeLoginPopup = () => { document.getElementById('loginAlertModal').style.display = 'none'; };
window.logoutUser = () => auth.signOut().then(() => window.location.href = "login.html");