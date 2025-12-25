const firebaseConfig = { 
    apiKey: "AIzaSyBzwhpHmeZdLf_nZrcPQirlnpj3Vhg9EqA", 
    authDomain: "thripudilibrary.firebaseapp.com", 
    projectId: "thripudilibrary", 
    storageBucket: "thripudilibrary.firebasestorage.app", 
    messagingSenderId: "887018912750", 
    appId: "1:887018912750:web:cc05190a72b13db816acff" 
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let currentAudioId = null;

document.addEventListener('DOMContentLoaded', () => {
    const userAvatarImg = document.getElementById('user-avatar-img');
    const defaultUserImg = 'assets/cover/default_user.jpg';
    const dName = document.getElementById('display-name');

    // Auth state observer for Profile Picture & Name
    auth.onAuthStateChanged(user => {
        if (user) {
            dName.innerText = user.displayName ? user.displayName.split(' ')[0] : "സുഹൃത്തേ";
            userAvatarImg.src = user.photoURL ? user.photoURL : defaultUserImg;
        } else {
            userAvatarImg.src = defaultUserImg;
            dName.innerText = "അതിഥി";
        }
    });

    // Dropdown Logic
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        });
    }

    window.addEventListener('click', () => {
        if(dropdown) dropdown.style.display = 'none';
    });
});

// Access & Modal Logics with Automatic History Update
window.checkAccess = function(id, type, cardId) {
    if (!auth.currentUser) {
        let msg = "ലോഗിൻ ചെയ്യുക";
        if(type === 'pdf') msg = "വായിക്കാനായി ലോഗിൻ ചെയ്യുക";
        else if(type === 'audio') msg = "കേൾക്കാനായി ലോഗിൻ ചെയ്യുക";
        else if(type === 'video') msg = "കാണാനായി ലോഗിൻ ചെയ്യുക";
        document.getElementById('loginMsg').innerText = msg;
        const currentPage = window.location.pathname.split("/").pop();
        document.getElementById('login-btn-link').href = `login.html?redirect=${currentPage}`;
        document.getElementById('loginAlertModal').style.setProperty('display', 'flex', 'important');
    } else {
        // --- ഹസ്റ്ററി സേവ് ചെയ്യാനുള്ള സ്മാർട്ട് ലോജിക് ---
        // നിലവിലുള്ള പേജുകളിലെ കാർഡിൽ നിന്ന് പേരും ചിത്രവും സ്ക്രിപ്റ്റ് സ്വയം എടുക്കുന്നു
        const cardElement = document.getElementById(cardId);
        const bName = cardElement.querySelector('.book-title').innerText;
        const bThumb = cardElement.querySelector('.book-cover').src;
        const uid = auth.currentUser.uid;

        let history = JSON.parse(localStorage.getItem('thripudi_history_' + uid)) || [];
        // ഡ്യൂപ്ലിക്കേഷൻ ഒഴിവാക്കാൻ പഴയ ലിസ്റ്റിൽ നിന്ന് നീക്കുന്നു
        history = history.filter(item => item.id !== id);
        
        history.push({
            id: id,
            name: bName,
            thumb: bThumb,
            date: new Date().toLocaleDateString('ml-IN')
        });

        if (history.length > 20) history.shift();
        localStorage.setItem('thripudi_history_' + uid, JSON.stringify(history));

        // --- പ്ലെയർ തുറക്കാനുള്ള ലോജിക് ---
        if (type === 'audio') {
            if (currentAudioId && currentAudioId !== id) {
                document.getElementById('player-' + currentAudioId).innerHTML = "";
                document.getElementById('card-' + currentAudioId).classList.remove('audio-active');
            }
            document.getElementById('player-' + id).innerHTML = `<div class="player-mask" style="width:80px;height:50px;"></div><iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;" scrolling="no"></iframe>`;
            document.getElementById(cardId).classList.add('audio-active');
            currentAudioId = id;
        } else if (type === 'video') {
            document.getElementById('videoFrameContainer').innerHTML = `<div class="player-mask" style="width:60px;height:60px;"></div><iframe src="https://drive.google.com/file/d/${id}/preview?rm=minimal" style="width:100%; height:100%; border:none;" allow="autoplay"></iframe>`;
            document.getElementById('videoOverlay').style.display = 'flex';
            document.body.style.overflow = "hidden";
        } else {
            document.getElementById('pdfFrame').src = `https://drive.google.com/file/d/${id}/preview?rm=minimal`;
            document.getElementById('pdfModal').style.display = 'flex';
            document.body.style.overflow = "hidden";
        }
    }
};

function logoutUser() { auth.signOut().then(() => { window.location.href = "logout_success.html"; }); }
function closeLoginPopup() { document.getElementById('loginAlertModal').style.setProperty('display', 'none', 'important'); }
function closeVideo() { document.getElementById('videoOverlay').style.display = 'none'; document.getElementById('videoFrameContainer').innerHTML = ""; document.body.style.overflow = "auto"; }
function closePdfModal() { document.getElementById('pdfModal').style.display = 'none'; document.getElementById('pdfFrame').src = ""; document.body.style.overflow = "auto"; }
