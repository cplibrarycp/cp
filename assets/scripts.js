<!DOCTYPE html>
<html lang="ml">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>ക്രമീകരണങ്ങൾ | THRIPUDI LIBRARY</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/styles.css">
    <style>
        .profile-section { padding: 40px 0; flex: 1; }
        .profile-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; text-align: center; border: 4px solid var(--outline-color); }
        .avatar-wrapper { position: relative; width: 110px; height: 110px; margin: 0 auto 20px; cursor: pointer; }
        .avatar-circle { width: 100%; height: 100%; background: #f0f0f0; border-radius: 50%; border: 4px solid var(--primary-teal); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .upload-hint { position: absolute; bottom: 0; right: 0; background: var(--primary-teal); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
        .form-group { margin-bottom: 15px; text-align: left; }
        label { display: block; margin-bottom: 5px; font-weight: 700; color: var(--secondary-dark); font-size: 0.85em; }
        input { width: 100%; padding: 12px; border: 2px solid var(--outline-color); border-radius: 8px; outline: none; font-family: inherit; }
        .btn-update { background: var(--primary-teal); color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; font-weight: 700; cursor: pointer; margin-top: 10px; }
        #fileInput { display: none; }
    </style>
</head>
<body>

<header>
    <div class="container navbar">
        <a href="dashboard.html" class="logo-container">
            <span class="logo-text">THRIPUDI LIBRARY</span>
            <img src="assets/cover/logo.png" alt="Logo" class="logo-img">
        </a>
        <div class="nav-links">
            <a class="nav-item" href="dashboard.html">Home</a>
            <div class="user-profile" id="user-profile-btn">
                <div class="user-avatar-wrap" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <img id="user-avatar-img" class="user-avatar-small" src="assets/cover/default_user.jpg">
                    <span style="color: white; font-size: 0.85em;"><span id="display-name">...</span> <i class="fas fa-caret-down"></i></span>
                </div>
            </div>
        </div>
    </div>
</header>

<section class="profile-section">
    <div class="container">
        <div class="profile-card">
            <div class="avatar-wrapper" onclick="document.getElementById('fileInput').click()">
                <div class="avatar-circle"><img id="currentPic" src="assets/cover/default_user.jpg"></div>
                <div class="upload-hint"><i class="fas fa-camera"></i></div>
                <input type="file" id="fileInput" accept="image/*" style="display: none;">
            </div>
            <h2 style="color: var(--secondary-dark); margin-bottom: 20px;">പ്രൊഫൈൽ ഫോട്ടോ മാറ്റുക</h2>
            <div class="form-group"><label>പേര്</label><input type="text" id="nameBox"></div>
            <button class="btn-update" id="saveBtn">ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക</button>
            <div id="msg" style="margin-top:15px; font-size:0.85em; font-weight:600;"></div>
        </div>
    </div>
</section>

<script src="assets/scripts.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>

<script>
    // താങ്കളുടെ പുതിയ Apps Script URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwone2MeuhMzyFXTYFKHW0OOherDw4wo517f7daK1bs6VxV7A2XvQkpRaKVBO4_FHSjGw/exec";

    const nameBox = document.getElementById('nameBox'),
          currentPic = document.getElementById('currentPic'),
          msg = document.getElementById('msg'),
          saveBtn = document.getElementById('saveBtn');

    let fileData = null;

    // ലോഗിൻ സ്റ്റാറ്റസ് ചെക്ക് ചെയ്യുന്നു
    auth.onAuthStateChanged((user) => {
        if (user) {
            nameBox.value = user.displayName || "";
            currentPic.src = user.photoURL || 'assets/cover/default_user.jpg';
        }
    });

    // ഫോട്ടോ സെലക്ട് ചെയ്യുമ്പോൾ
    document.getElementById('fileInput').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentPic.src = ev.target.result;
            fileData = { 
                base64: ev.target.result.split(',')[1], 
                type: file.type, 
                name: file.name 
            };
        };
        reader.readAsDataURL(file);
    };

    // സേവ് ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        saveBtn.disabled = true;
        msg.innerText = "അപ്‌ലോഡ് ചെയ്യുന്നു...";
        msg.style.color = "blue";

        try {
            let finalPhotoUrl = user.photoURL;

            // 1. ഫോട്ടോ മാത്രം അപ്‌ലോഡ് ചെയ്യുന്നു (പഴയ മാജിക് ലോജിക്)
            if (fileData) {
                const p = new URLSearchParams();
                p.append('fileData', fileData.base64);
                p.append('mimeType', fileData.type);
                p.append('fileName', fileData.name);
                
                const r = await fetch(SCRIPT_URL, { method: 'POST', body: p });
                const j = await r.json();
                
                if (j.result === "Success") {
                    finalPhotoUrl = j.url; // ഡ്രൈവ് ലിങ്ക് ഇവിടെ വരുന്നു
                }
            }

            // 2. ഫയർബേസ് പ്രൊഫൈൽ മാത്രം അപ്‌ഡേറ്റ് ചെയ്യുന്നു
            await user.updateProfile({
                displayName: nameBox.value,
                photoURL: finalPhotoUrl
            });

            msg.style.color = "green";
            msg.innerText = "വിജയകരമായി മാറി!";
            
            // റീലോഡ് ചെയ്യുന്നു
            setTimeout(() => { location.reload(); }, 1200);

        } catch (e) {
            msg.style.color = "red";
            msg.innerText = "Error!";
            saveBtn.disabled = false;
        }
    };
</script>
</body>
</html>
