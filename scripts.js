// Données simulées
const mockVideos = [
    {
        id: 1,
        url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-1230-large.mp4',
        user: {
            username: 'dancequeen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        caption: 'Apprends cette choré avec moi ! #danse #fun',
        likes: 12400,
        comments: 1200,
        shares: 543
    },
    {
        id: 2,
        url: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-tricks-with-skateboard-in-a-parking-lot-34553-large.mp4',
        user: {
            username: 'sk8erboi',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        caption: 'Nouveau trick ce week-end! #skate #extreme',
        likes: 8700,
        comments: 876,
        shares: 321
    }
];

// Éléments DOM
const elements = {
    videoFeed: document.getElementById('videoFeed'),
    createBtn: document.getElementById('createBtn'),
    createBtnBottom: document.getElementById('createBtnBottom'),
    createModal: document.getElementById('createModal'),
    closeModal: document.getElementById('closeModal'),
    videoPreview: document.getElementById('videoPreview'),
    recordBtn: document.getElementById('recordBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    videoInput: document.getElementById('videoInput'),
    publishBtn: document.getElementById('publishBtn'),
    videoCaption: document.getElementById('videoCaption'),
    recordIndicator: document.querySelector('.record-indicator')
};

// État de l'application
let state = {
    currentVideoIndex: 0,
    videos: [],
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    videoStream: null
};

// Initialisation
function initApp() {
    loadVideos();
    setupEventListeners();
}

// Charger les vidéos
function loadVideos() {
    // En production: faire une requête API
    state.videos = mockVideos;
    renderVideos();
}

// Afficher les vidéos
function renderVideos() {
    elements.videoFeed.innerHTML = state.videos.map(video => `
        <div class="video-container" data-video-id="${video.id}">
            <video loop muted playsinline>
                <source src="${video.url}" type="video/mp4">
            </video>
            <div class="video-info">
                <div class="creator-info">
                    <img src="${video.user.avatar}" alt="${video.user.username}">
                    <span>@${video.user.username}</span>
                </div>
                <div class="video-caption">${video.caption}</div>
            </div>
            <div class="video-actions">
                <div class="action">
                    <i class="fas fa-heart"></i>
                    <span>${formatNumber(video.likes)}</span>
                </div>
                <div class="action">
                    <i class="fas fa-comment"></i>
                    <span>${formatNumber(video.comments)}</span>
                </div>
                <div class="action">
                    <i class="fas fa-share"></i>
                    <span>${formatNumber(video.shares)}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Initialiser la lecture de la première vidéo
    playCurrentVideo();
}

// Formater les nombres (1K, 1M)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Boutons de création
    elements.createBtn.addEventListener('click', openCreateModal);
    elements.createBtnBottom.addEventListener('click', openCreateModal);
    
    // Modal de création
    elements.closeModal.addEventListener('click', closeCreateModal);
    elements.uploadBtn.addEventListener('click', () => elements.videoInput.click());
    elements.videoInput.addEventListener('change', handleVideoUpload);
    elements.recordBtn.addEventListener('click', toggleRecording);
    elements.publishBtn.addEventListener('click', publishVideo);
    
    // Interactions vidéo
    document.addEventListener('click', (e) => {
        // Gestion des likes
        if (e.target.classList.contains('fa-heart')) {
            handleLike(e.target);
        }
        
        // Gestion des commentaires
        if (e.target.classList.contains('fa-comment')) {
            handleComment(e.target.closest('.video-container'));
        }
        
        // Gestion des partages
        if (e.target.classList.contains('fa-share')) {
            handleShare(e.target.closest('.video-container'));
        }
    });
    
    // Détection du défilement
    window.addEventListener('scroll', handleScroll);
    
    // Fermer le modal en cliquant à l'extérieur
    elements.createModal.addEventListener('click', (e) => {
        if (e.target === elements.createModal) {
            closeCreateModal();
        }
    });
}

// Gérer le défilement
function handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== state.currentVideoIndex && newIndex >= 0 && newIndex < state.videos.length) {
        // Arrêter la vidéo précédente
        const prevVideo = document.querySelector(`.video-container:nth-child(${state.currentVideoIndex + 1}) video`);
        if (prevVideo) prevVideo.pause();
        
        // Mettre à jour l'index
        state.currentVideoIndex = newIndex;
        
        // Lancer la nouvelle vidéo
        playCurrentVideo();
    }
}

// Lire la vidéo actuelle
function playCurrentVideo() {
    const currentVideoElement = document.querySelector(`.video-container:nth-child(${state.currentVideoIndex + 1}) video`);
    if (currentVideoElement) {
        currentVideoElement.play().catch(e => {
            console.log('La lecture automatique a été bloquée:', e);
        });
    }
}

// Gérer les likes
function handleLike(heartIcon) {
    heartIcon.classList.toggle('heart-animation');
    
    // Mettre à jour le compteur
    if (heartIcon.classList.contains('heart-animation')) {
        const counter = heartIcon.nextElementSibling;
        let count = parseInt(counter.textContent.replace(/[KM]/g, '')) * (counter.textContent.includes('K') ? 1000 : 1);
        counter.textContent = formatNumber(count + 1);
    }
}

// Gérer les commentaires
function handleComment(videoContainer) {
    const videoId = videoContainer.dataset.videoId;
    alert(`Fonctionnalité de commentaires pour la vidéo ${videoId} à implémenter`);
}

// Gérer les partages
function handleShare(videoContainer) {
    const videoId = videoContainer.dataset.videoId;
    const video = state.videos.find(v => v.id == videoId);
    
    if (navigator.share) {
        navigator.share({
            title: `TikTok Clone - @${video.user.username}`,
            text: video.caption,
            url: window.location.href
        }).catch(err => {
            console.log('Erreur de partage:', err);
        });
    } else {
        alert(`Partager la vidéo: ${video.caption}\nURL: ${video.url}`);
    }
}

// Ouvrir le modal de création
function openCreateModal() {
    elements.createModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fermer le modal de création
function closeCreateModal() {
    elements.createModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetVideoCreator();
}

// Réinitialiser le créateur de vidéo
function resetVideoCreator() {
    const videoElement = elements.videoPreview.querySelector('video');
    if (videoElement) {
        videoElement.pause();
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        videoElement.src = '';
        videoElement.srcObject = null;
        videoElement.style.display = 'none';
    }
    elements.videoPreview.querySelector('i').style.display = 'block';
    elements.videoPreview.querySelector('p').style.display = 'block';
    elements.videoCaption.value = '';
    elements.videoInput.value = '';
    
    if (state.isRecording) {
        toggleRecording();
    }
    
    elements.recordBtn.classList.remove('recording');
    elements.recordIndicator.style.display = 'none';
    elements.recordBtn.innerHTML = '<i class="fas fa-video"></i> Filmer';
    elements.recordBtn.style.backgroundColor = '#333';
}

// Gérer l'upload de vidéo
function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB max
            alert('Veuillez sélectionner une vidéo de moins de 50MB');
            return;
        }
        
        const videoUrl = URL.createObjectURL(file);
        showVideoPreview(videoUrl);
    }
}

// Afficher la prévisualisation vidéo
function showVideoPreview(videoUrl) {
    let videoElement = elements.videoPreview.querySelector('video');
    
    if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.playsInline = true;
        elements.videoPreview.appendChild(videoElement);
    }
    
    videoElement.src = videoUrl;
    videoElement.style.display = 'block';
    elements.videoPreview.querySelector('i').style.display = 'none';
    elements.videoPreview.querySelector('p').style.display = 'none';
    
    videoElement.onloadedmetadata = () => {
        if (videoElement.duration > 60) {
            alert('Les vidéos doivent faire moins de 60 secondes');
            resetVideoCreator();
        }
    };
}

// Basculer l'enregistrement
async function toggleRecording() {
    if (!state.isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: true 
            });
            
            let videoElement = elements.videoPreview.querySelector('video');
            if (!videoElement) {
                videoElement = document.createElement('video');
                videoElement.autoplay = true;
                videoElement.playsInline = true;
                elements.videoPreview.appendChild(videoElement);
            }
            
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            elements.videoPreview.querySelector('i').style.display = 'none';
            elements.videoPreview.querySelector('p').style.display = 'none';
            
            state.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            });
            
            state.recordedChunks = [];
            
            state.mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    state.recordedChunks.push(e.data);
                }
            };
            
            state.mediaRecorder.onstop = () => {
                const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                showVideoPreview(videoUrl);
                
                // Arrêter le flux média
                stream.getTracks().forEach(track => track.stop());
            };
            
            state.mediaRecorder.start(100); // Collecte des données toutes les 100ms
            state.isRecording = true;
            state.videoStream = stream;
            
            elements.recordBtn.classList.add('recording');
            elements.recordIndicator.style.display = 'block';
            elements.recordBtn.innerHTML = '<i class="fas fa-stop"></i> Arrêter';
            elements.recordBtn.style.backgroundColor = '#ff0050';
            
        } catch (err) {
            console.error('Erreur d\'accès à la caméra:', err);
            alert(`Erreur: ${err.message}`);
            resetVideoCreator();
        }
    } else {
        // Arrêter l'enregistrement
        state.mediaRecorder.stop();
        state.isRecording = false;
        elements.recordBtn.classList.remove('recording');
        elements.recordIndicator.style.display = 'none';
        elements.recordBtn.innerHTML = '<i class="fas fa-video"></i> Filmer';
        elements.recordBtn.style.backgroundColor = '#333';
    }
}

// Publier la vidéo
async function publishVideo() {
    const caption = elements.videoCaption.value.trim();
    const videoElement = elements.videoPreview.querySelector('video');
    
    if (!videoElement || (!videoElement.src && !videoElement.srcObject)) {
        alert('Veuillez sélectionner ou enregistrer une vidéo');
        return;
    }
    
    // Si enregistrement en cours, arrêter d'abord
    if (state.isRecording) {
        await toggleRecording();
    }
    
    let videoUrl;
    let videoBlob;
    
    // Cas d'un enregistrement
    if (state.recordedChunks.length > 0) {
        videoBlob = new Blob(state.recordedChunks, { type: 'video/webm' });
        videoUrl = URL.createObjectURL(videoBlob);
    } 
    // Cas d'un upload
    else if (videoElement.src) {
        const response = await fetch(videoElement.src);
        videoBlob = await response.blob();
        videoUrl = videoElement.src;
    }
    
    // Validation de la durée
    if (videoElement.duration > 60) {
        alert('Les vidéos doivent faire moins de 60 secondes');
        return;
    }
    
    // Créer la nouvelle vidéo
    const newVideo = {
        id: Date.now(),
        url: videoUrl,
        user: {
            username: 'moi',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        caption: caption || 'Ma nouvelle vidéo',
        likes: 0,
        comments: 0,
        shares: 0,
        duration: videoElement.duration
    };
    
    // En production: envoyer au serveur
    console.log('Vidéo à publier:', {
        size: videoBlob.size,
        duration: newVideo.duration,
        type: videoBlob.type
    });
    
    // Ajouter à la liste et actualiser
    state.videos.unshift(newVideo);
    renderVideos();
    closeCreateModal();
    
    // Faire défiler vers le haut pour voir la nouvelle vidéo
    window.scrollTo(0, 0);
    
    alert('Vidéo publiée avec succès!');
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initApp);