(function() {
    'use strict';
    
    let currentBlobUrl = null;
    
    const elements = {
        fileInput: document.getElementById('fileInput'),
        uploadBtn: document.getElementById('uploadBtn'),
        uploadZone: document.getElementById('uploadZone'),
        resetBtn: document.getElementById('resetBtn'),
        fileNameDisplay: document.getElementById('fileNameDisplay'),
        audioPlayer: document.getElementById('audioPlayer'),
        trackTitle: document.getElementById('trackTitle'),
        fileTypeIndicator: document.getElementById('fileTypeIndicator')
    };

    let isFileLoaded = false;

    function cleanupBlobUrl() {
        try {
            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
                currentBlobUrl = null;
            }
        } catch(e) {
        }
    }

    function resetPlayer() {
        elements.audioPlayer.onerror = null;
        elements.audioPlayer.onloadeddata = null;
        
        elements.audioPlayer.pause();
        elements.audioPlayer.currentTime = 0;
        
        elements.audioPlayer.src = '';
        
        cleanupBlobUrl();
        isFileLoaded = false;
        
        elements.fileNameDisplay.textContent = 'файл не выбран';
        elements.trackTitle.textContent = '———';
        elements.fileTypeIndicator.textContent = '⏤';
        elements.fileInput.value = '';
        elements.uploadZone.classList.remove('file-loaded');
    }

    function handleFileSelect(file) {
        const allowedExtensions = ['MP3', 'M4A', 'WAV', 'OGG', 'FLAC'];
        const fileExtension = file.name.split('.').pop()?.toUpperCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            alert('Поддерживаются только:\n• MP3\n• M4A\n• WAV\n• OGG\n• FLAC');
            return false;
        }
        
        if (!file.type.startsWith('audio/') && fileExtension !== 'M4A') {
            alert('Файл не распознан как аудио');
            return false;
        }

        elements.fileNameDisplay.textContent = `🎵 ${file.name}`;
        elements.fileTypeIndicator.textContent = fileExtension;
        
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        elements.trackTitle.textContent = nameWithoutExt.length > 30 ? 
            nameWithoutExt.substring(0, 27) + '…' : nameWithoutExt;

        elements.uploadZone.classList.add('file-loaded');
        isFileLoaded = true;
        return true;
    }

    function loadAudioFile(file) {
        if (!handleFileSelect(file)) {
            elements.fileInput.value = '';
            return;
        }

        cleanupBlobUrl();
        elements.audioPlayer.pause();
        elements.audioPlayer.currentTime = 0;
        elements.audioPlayer.onerror = null; 
        
        currentBlobUrl = URL.createObjectURL(file);
        elements.audioPlayer.src = currentBlobUrl;
        
        elements.audioPlayer.onerror = () => {
            if (isFileLoaded) { 
                alert('Ошибка воспроизведения.\nПроверьте целостность файла.');
                resetPlayer();
            }
        };
        
        elements.audioPlayer.onloadeddata = () => {
            console.log('Аудио успешно загружено');
        };
    }

    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileNameDisplay.addEventListener('click', () => elements.fileInput.click());
    
    elements.uploadZone.addEventListener('click', (e) => {
        if (!e.target.closest('.upload-btn')) {
            elements.fileInput.click();
        }
    });

    elements.uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.add('drag-over');
    });

    elements.uploadZone.addEventListener('dragleave', (e) => {
        if (!elements.uploadZone.contains(e.relatedTarget)) {
            elements.uploadZone.classList.remove('drag-over');
        }
    });

    elements.uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            elements.fileInput.files = files;
            loadAudioFile(files[0]);
        }
    });

    elements.fileInput.addEventListener('change', () => {
        if (elements.fileInput.files[0]) {
            loadAudioFile(elements.fileInput.files[0]);
        }
    });

    elements.resetBtn.addEventListener('click', resetPlayer);

    window.addEventListener('beforeunload', cleanupBlobUrl);
})();
