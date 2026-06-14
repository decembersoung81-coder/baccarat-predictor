document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const btnUpload = document.getElementById('btnUpload');
    const btnReset = document.getElementById('btnReset');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const alertBanner = document.getElementById('alertBanner');
    
    const statTotal = document.getElementById('statTotal');
    const statPlayer = document.getElementById('statPlayer');
    const statBanker = document.getElementById('statBanker');
    const statTie = document.getElementById('statTie');
    
    const stepBadge = document.getElementById('stepBadge');
    const statusMsg = document.getElementById('statusMsg');
    const predictionText = document.getElementById('predictionText');
    const accuracyRate = document.getElementById('accuracyRate');
    const trendText = document.getElementById('trendText');
    const beadPlate = document.getElementById('beadPlate');

    // Game State
    let gameHistory = [];
    let stats = { P: 0, B: 0, T: 0 };
    let totalPredictions = 0;
    let correctPredictions = 0;
    let currentPrediction = 'WAIT';

    // Click to upload trigger
    dropZone.addEventListener('click', () => fileInput.click());

    // File Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#10b981';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(59, 130, 246, 0.4)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files);
    });

    btnUpload.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files);
        } else {
            alert('ကျေးဇူးပြု၍ ဖတ်ရန် CSV သို့မဟုတ် TXT ဖိုင်တစ်ခု အရင်ရွေးချယ်ပေးပါဗျာ။');
        }
    });

    // Reset System
    btnReset.addEventListener('click', () => {
        if (confirm('ဒေတာမှတ်တမ်းအားလုံးကို ဖျက်ပြီး အစကနေ ပြန်စမှာ သေချာပါသလား၊ ဗျာ။')) {
            gameHistory = [];
            stats = { P: 0, B: 0, T: 0 };
            totalPredictions = 0;
            correctPredictions = 0;
            currentPrediction = 'WAIT';
            fileInput.value = '';
            updateUI();
            beadPlate.innerHTML = '';
            statusMsg.textContent = 'စနစ်အသစ်ပြန်စပါပြီ';
            alertBanner.style.display = 'none';
        }
    });
    // Manual Input Buttons
    document.getElementById('addP').addEventListener('click', () => addManualResult('P'));
    document.getElementById('addB').addEventListener('click', () => addManualResult('B'));
    document.getElementById('addT').addEventListener('click', () => addManualResult('T'));

    // Process File
    function handleFile(file) {
        const reader = new FileReader();
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                progressBar.style.width = percent + '%';
            }
        };

        reader.onload = (e) => {
            progressBar.style.width = '100%';
            setTimeout(() => { progressContainer.style.display = 'none'; }, 500);
            
            const text = e.target.result;
            parseData(text);
        };

        reader.readAsText(file);
    }
    function parseData(text) {
        gameHistory = [];
        stats = { P: 0, B: 0, T: 0 };
        beadPlate.innerHTML = '';
        let hasError = false;

        const cleanText = text.replace(/[\r\n,]+/g, ' ').toUpperCase();
        const tokens = cleanText.split(/\s+/);

        tokens.forEach(token => {
            if (!token) return;
            let char = token.trim();
            
            if (char === 'PLAYER' || char === 'P') char = 'P';
            else if (char === 'BANKER' || char === 'B') char = 'B';
            else if (char === 'TIE' || char === 'T') char = 'T';
            else {
                hasError = true;
                return;
            }

            if (currentPrediction !== 'WAIT' && currentPrediction !== 'TIE') {
                totalPredictions++;
                if (currentPrediction === char) {
                    correctPredictions++;
                }
            }

            gameHistory.push(char);
            stats[char]++;
            addBeadToPlate(char);
            
            currentPrediction = calculateNextPrediction();
        });

        if (hasError) alertBanner.style.display = 'block';
        else alertBanner.style.display = 'none';

        statusMsg.textContent = 'ဖိုင်ဖတ်ရုံမှတ်တမ်း ပြီးဆုံးပါပြီ';
        updateUI();
    }
    function addManualResult(result) {
        if (currentPrediction !== 'WAIT' && currentPrediction !== 'TIE') {
            totalPredictions++;
            if (currentPrediction === result) {
                correctPredictions++;
            }
        }

        gameHistory.push(result);
        stats[result]++;
        addBeadToPlate(result);
        
        currentPrediction = calculateNextPrediction();
        statusMsg.textContent = 'ဒေတာအသစ် ထည့်သွင်းပြီးပါပြီ';
        updateUI();
    }

    // AI Core Logic (Pattern matching)
    function calculateNextPrediction() {
        const len = gameHistory.length;
        if (len < 3) return 'WAIT';

        const last1 = gameHistory[len - 1];
        const last2 = gameHistory[len - 2];
        const last3 = gameHistory[len - 3];

        if (last1 === last2 && last2 === last3) {
            if (last1 === 'P') return 'B';
            if (last1 === 'B') return 'P';
        }

        if (last1 !== last2 && last2 !== last3) {
            return last1 === 'P' ? 'B' : 'P';
        }

        return stats.P >= stats.B ? 'P' : 'B';
    }

    function addBeadToPlate(type) {
        const bead = document.createElement('div');
        bead.className = `bead ${type}`;
        bead.textContent = type;
        beadPlate.appendChild(bead);
        beadPlate.scrollLeft = beadPlate.scrollWidth;
    }

    function updateUI() {
        statTotal.textContent = gameHistory.length;
        statPlayer.textContent = stats.P;
        statBanker.textContent = stats.B;
        statTie.textContent = stats.T;
        
        stepBadge.textContent = `ပွဲစဉ် #${gameHistory.length}`;
        predictionText.textContent = currentPrediction;
        
        predictionText.className = 'prediction-output ' + currentPrediction;

        if (totalPredictions > 0) {
            const rate = Math.round((correctPredictions / totalPredictions) * 100);
            accuracyRate.textContent = `${rate}%`;
        } else {
            accuracyRate.textContent = '0%';
        }

        if (gameHistory.length > 5) {
            if (stats.P > stats.B * 1.5) trendText.textContent = 'PLAYER အားသာနေသည်';
            else if (stats.B > stats.P * 1.5) trendText.textContent = 'BANKER အားသာနေသည်';
            else trendText.textContent = 'ပုံမှန်အခြေအနေ (မျှနေသည်)';
        } else {
            trendText.textContent = 'ပုံမှန်';
        }
    }
});
