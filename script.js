let db;
let history = [];
let currentStep = 1;

const request = indexedDB.open("BaccaratPredictorDB", 1);
request.onupgradeneeded = (e) => { db = e.target.result; db.createObjectStore("files", { keyPath: "name" }); };
request.onsuccess = (e) => { db = e.target.result; };

async function handleZipUpload(files) {
    const zip = await JSZip.loadAsync(files);
    const store = db.transaction(["files"], "readwrite").objectStore("files");
    for (let filename in zip.files) {
        if (filename.endsWith(".json")) {
            const content = await zip.files[filename].async("string");
            store.put({ name: filename, history: JSON.parse(content) });
        }
    }
    alert("Zip ဖိုင်သွင်းပြီးပါပြီ။");
}

async function getPrediction() {
    let scores = { 'B': 0, 'P': 0 };
    let currentPattern = history.slice(-currentStep);
    if (currentPattern.length === 0) return 'B';

    const store = db.transaction(["files"], "readonly").objectStore("files");
    await new Promise((resolve) => {
        store.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                let fileData = cursor.value.history;
                for(let i=0; i < fileData.length - currentStep; i++) {
                    let sub = fileData.slice(i, i + currentStep);
                    if (JSON.stringify(sub) === JSON.stringify(currentPattern)) {
                        let next = fileData[i + currentStep];
                        let weight = (i / fileData.length) + 1;
                        if (scores.hasOwnProperty(next)) scores[next] += weight;
                    }
                }
                cursor.continue();
            } else { resolve(); }
        };
    });
    return (scores['B'] >= scores['P']) ? 'B' : 'P';
}

async function addResult(result) {
    if (result === 'T') { history.push('T'); alert("Tie - Step မမြင့်ပါ"); return; }
    let prediction = await getPrediction();
    document.getElementById('prediction').innerText = "ခန့်မှန်းချက်: " + prediction;
    currentStep = (result === prediction) ? 1 : (currentStep >= 9 ? 1 : currentStep + 1);
    history.push(result);
}

function undoLast() { history.pop(); alert("ဖျက်လိုက်ပါပြီ"); }
function resetGame() { history = []; currentStep = 1; alert("ဝိုင်းသစ်စ"); }
function saveResults() {
    const blob = new Blob([JSON.stringify(history)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "live_data_" + Date.now() + ".json";
    a.click();
}
function trainAllData() { alert("Database ထဲတွင် အသင့်ရှိနေပါသည်။"); }
