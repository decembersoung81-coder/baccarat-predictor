let history = []; 
let currentStep = 1; 

function addResult(result) {
    if (result === 'T') {
        history.push('T'); 
        alert("Tie ကျသည် (Step မမြင့်ပါ)");
        return; 
    }

    let pattern = history.slice(-currentStep); 
    let prediction = (pattern.length > 0 && pattern[pattern.length-1] === 'B') ? 'P' : 'B';
    document.getElementById('prediction').innerText = "ခန့်မှန်းချက်: " + prediction;

    if (result === prediction) {
        currentStep = 1; 
    } else {
        currentStep = (currentStep >= 9) ? 1 : currentStep + 1; 
    }
    history.push(result);
}

function saveResults() {
    let blob = new Blob([JSON.stringify(history)], {type: "application/json"});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "history.json";
    a.click();
}
