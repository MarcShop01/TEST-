// ===== CONFIGURATION =====
const CONFIG = {
  maxVideoDuration: 60, // secondes
  maxFileSize: 50 * 1024 * 1024 // 50MB
};

// ===== ÉTAT DE L'APPLICATION =====
const state = {
  videos: [],
  currentVideoIndex: 0,
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: [],
  videoStream: null
};

// ===== ÉLÉMENTS DOM =====
const elements = {
  // Navigation
  navbar: document.querySelector('.navbar'),
  bottomNav: document.querySelector('.bottom-nav'),
  
  // Vidéos
  videoFeed: document.getElementById('videoFeed'),
  
  // Création
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

// ===== DONNÉES SIMULÉES =====
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

// ===== FONCTIONS PRINCIPALES =====

// Initialisation de l'app
function initApp() {
  console.log('Initialisation de l\'application...');
  loadVideos();
  setupEventListeners();
}

// Charger les vidéos
function loadVideos() {
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

  playCurrentVideo();
}

// Jouer la vidéo actuelle
function playCurrentVideo() {
  const videos = document.querySelectorAll('.video-container video');
  if (videos[state.currentVideoIndex]) {
    videos[state.currentVideoIndex].play().catch(e => {
      console.log('La lecture automatique a été bloquée:', e);
    });
  }
}

// Gérer le défilement
function handleScroll() {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const newIndex = Math.round(scrollPosition / windowHeight);
  
  if (newIndex !== state.currentVideoIndex && newIndex >= 0 && newIndex < state.videos.length) {
    const prevVideo = document.querySelector(`.video-container:nth-child(${state.currentVideoIndex + 1}) video`);
    if (prevVideo) prevVideo.pause();
    
    state.currentVideoIndex = newIndex;
    playCurrentVideo();
  }
}

// ===== FONCTIONS DE CRÉATION =====

// Ouvrir le modal
function openCreateModal() {
  elements.createModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Fermer le modal
function closeCreateModal() {
  elements.createModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  resetVideoCreator();
}

// Réinitialiser l'interface de création
function resetVideoCreator() {
  const videoElement = elements.videoPreview.querySelector('video');
  if (videoElement) {
    videoElement.pause();
    if (videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    videoElement.remove();
  }
  
  elements.videoPreview.querySelector('i').style.display = 'block';
  elements.videoPreview.querySelector('p').style.display = 'block';
  elements.videoCaption.value = '';
  elements.videoInput.value = '';
  
  if (state.isRecording) {
    toggleRecording();
  }
  
  state.recordedChunks = [];
  state.videoStream = null;
}

// Démarrer/arrêter l'enregistrement
async function toggleRecording() {
  if (!state.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.srcObject = stream;
      elements.videoPreview.appendChild(videoElement);
      
      elements.videoPreview.querySelector('i').style.display = 'none';
      elements.videoPreview.querySelector('p').style.display = 'none';
      
      state.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000
      });
      
      state.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          state.recordedChunks.push(e.data);
        }
      };
      
      state.mediaRecorder.onstop = () => {
        const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        const previewVideo = elements.videoPreview.querySelector('video');
        previewVideo.srcObject = null;
        previewVideo.src = videoUrl;
        previewVideo.controls = true;
      };
      
      state.mediaRecorder.start(100);
      state.isRecording = true;
      state.videoStream = stream;
      
      elements.recordBtn.classList.add('recording');
      elements.recordIndicator.style.display = 'block';
      elements.recordBtn.innerHTML = '<i class="fas fa-stop"></i> Arrêter';
      
    } catch (err) {
      console.error('Erreur caméra:', err);
      alert(`Erreur: ${err.message}\nVérifiez les permissions de la caméra`);
    }
  } else {
    state.mediaRecorder.stop();
    state.isRecording = false;
    elements.recordBtn.classList.remove('recording');
    elements.recordIndicator.style.display = 'none';
    elements.recordBtn.innerHTML = '<i class="fas fa-video"></i> Filmer';
  }
}

// Gérer l'upload
function handleVideoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > CONFIG.maxFileSize) {
    alert(`Veuillez sélectionner une vidéo de moins de ${CONFIG.maxFileSize / (1024 * 1024)}MB`);
    return;
  }

  const videoUrl = URL.createObjectURL(file);
  showVideoPreview(videoUrl);
}

// Afficher la prévisualisation
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
    if (videoElement.duration > CONFIG.maxVideoDuration) {
      alert(`Les vidéos doivent faire moins de ${CONFIG.maxVideoDuration} secondes`);
      resetVideoCreator();
    }
  };
}

// Publier la vidéo
async function publishVideo() {
  const caption = elements.videoCaption.value.trim();
  const videoElement = elements.videoPreview.querySelector('video');
  
  if (!videoElement || (!videoElement.src && !videoElement.srcObject)) {
    alert('Veuillez sélectionner ou enregistrer une vidéo');
    return;
  }
  
  if (state.isRecording) {
    await toggleRecording();
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  let videoBlob;
  if (state.recordedChunks.length > 0) {
    videoBlob = new Blob(state.recordedChunks, { type: 'video/webm' });
  } else if (videoElement.src) {
    const response = await fetch(videoElement.src);
    videoBlob = await response.blob();
  }
  
  // Simuler l'upload
  console.log('Publication de la vidéo:', {
    size: videoBlob.size,
    duration: videoElement.duration,
    type: videoBlob.type
  });
  
  // Ajouter à la liste
  const newVideo = {
    id: Date.now(),
    url: URL.createObjectURL(videoBlob),
    user: {
      username: 'moi',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
    },
    caption: caption || 'Ma nouvelle vidéo',
    likes: 0,
    comments: 0,
    shares: 0
  };
  
  state.videos.unshift(newVideo);
  renderVideos();
  closeCreateModal();
  window.scrollTo(0, 0);
  
  alert('Vidéo publiée avec succès !');
}

// ===== UTILITAIRES =====
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

function setupEventListeners() {
  // Navigation
  elements.createBtn.addEventListener('click', openCreateModal);
  elements.createBtnBottom.addEventListener('click', openCreateModal);
  elements.closeModal.addEventListener('click', closeCreateModal);
  
  // Création
  elements.recordBtn.addEventListener('click', toggleRecording);
  elements.uploadBtn.addEventListener('click', () => elements.videoInput.click());
  elements.videoInput.addEventListener('change', handleVideoUpload);
  elements.publishBtn.addEventListener('click', publishVideo);
  
  // Interactions
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-heart')) {
      e.target.classList.toggle('heart-animation');
    }
  });
  
  // Défilement
  window.addEventListener('scroll', handleScroll);
  
  // Fermer le modal en cliquant à l'extérieur
  elements.createModal.addEventListener('click', (e) => {
    if (e.target === elements.createModal) {
      closeCreateModal();
    }
  });
}

// ===== DÉMARRAGE =====
document.addEventListener('DOMContentLoaded', initApp);
