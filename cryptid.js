class Cryptid {
    constructor(name, baseProbability, distanceMultiplier, luckMultiplier) {
        this.name = name;
        this.baseProbability = baseProbability;
        this.distanceMultiplier = distanceMultiplier;
        this.luckMultiplier = luckMultiplier;
    }
}

const cryptids = [
    new Cryptid('normal', 0.5, 1, 1),
    new Cryptid('rare', 0.1, 5, 5),
    new Cryptid('unique', 0.05, 10, 10),
    new Cryptid('legendary', 0.01, 50, 50),
    new Cryptid('mythical', 0.001, 100, 100)
];

function calculateProbabilities(distance, luck) {
    let totalProbability = 0;
    const probabilities = cryptids.map(cryptid => {
        const adjustedProbability = cryptid.baseProbability * 
                                    (1 + (distance * cryptid.distanceMultiplier) / 100) * 
                                    (1 + (luck * cryptid.luckMultiplier) / 100);
        totalProbability += adjustedProbability;
        return adjustedProbability;
    });

    return cryptids.map((cryptid, index) => {
        return {
            name: cryptid.name,
            probability: (probabilities[index] / totalProbability) * 100
        };
    });
}

function getRandomNumber() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
}

function selectCryptid(distance, luck) {
    const probabilities = calculateProbabilities(distance, luck);
    let totalProbability = 0;
    const adjustedProbabilities = probabilities.map(p => {
        totalProbability += p.probability;
        return p.probability;
    });

    const randomValue = getRandomNumber() * totalProbability;
    let cumulativeProbability = 0;

    for (let i = 0; i < cryptids.length; i++) {
        cumulativeProbability += adjustedProbabilities[i];
        if (randomValue < cumulativeProbability) {
            return cryptids[i];
        }
    }
}

document.getElementById('cryptidForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const distance =  0 ;
    const luck = parseFloat(document.getElementById('luck').value);

    const probabilities = calculateProbabilities(distance, luck);
    const probabilityTable = document.getElementById('probabilityTableBody');
    probabilityTable.innerHTML = '';
    
    probabilities.forEach(prob => {
        const row = probabilityTable.insertRow();
        const nameCell = row.insertCell(0);
        const probabilityCell = row.insertCell(1);
    
        nameCell.textContent = prob.name;
        probabilityCell.textContent = `${prob.probability.toFixed(2)}%`;
    });
    
});

function displayBaseValues() {
    const baseValueList = document.getElementById('baseValueList');
    cryptids.forEach(cryptid => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cryptid.name}</td>
            <td>${cryptid.baseProbability}</td>
            <td>${cryptid.distanceMultiplier}</td>
            <td>${cryptid.luckMultiplier}</td>
        `;
        baseValueList.appendChild(row);
    });
}
function roundTo000(number) {
    if (number % distanceRange === 0) {
        return number;
    }
    return Math.round(number / distanceRange) * distanceRange;
}

function decreaseNextCryptidAhead() {
    const A = nextCryptidAhead - Math.pow(parabolValue, parabolFactor);
    return A < 10 ? 10 : A;
}

function updateNextCryptidAhead(){
    if(nextCryptidAhead === 10) return;
    nextCryptidAhead = decreaseNextCryptidAhead(); 
    document.getElementById("cryptidEncounterValue").innerText = nextCryptidAhead   
    console.log("next cryptid ahead updated", nextCryptidAhead);
}
let nextCryptidAhead = 250; // meter
let distanceFromStartPoint = 0;
const distanceRange = 1000; // meter
const parabolFactor = 2;
const parabolValue = 5;
let lastUpdatedPoint = 0;
let lastCryptidEncounterValue = 0;
// Simülasyon sırasında karşılaşılan cryptidleri ve diğer değerleri HTML'e ekleme
function updateResults(distance, nextCryptidDistance) {
    document.getElementById("walked").innerText = (distance / 1000).toFixed(2)
    document.getElementById("nextCryptid").innerText = nextCryptidDistance > 0 ? nextCryptidDistance : 0
}
function addLog(crytid,distance){
    const logList = document.getElementById('logList');
     const li = document.createElement('li');
     li.innerHTML = `You met  <strong style="text-transform:capitalize">${crytid}</strong> cryptid at ${distance}`;
     logList.appendChild(li);
}
function updateProbalities(distance){
    const luck = parseFloat(document.getElementById('luck').value);

    const probabilities = calculateProbabilities(distance, luck);
    const probabilityTable = document.getElementById('probabilityTableBody');
    probabilityTable.innerHTML = '';
    
    probabilities.forEach(prob => {
        const row = probabilityTable.insertRow();
        const nameCell = row.insertCell(0);
        const probabilityCell = row.insertCell(1);
    
        nameCell.textContent = prob.name;
        probabilityCell.textContent = `${prob.probability.toFixed(2)}%`;
    });
}

document.getElementById('startWalking').addEventListener('click', function() {
    const walkDistance = parseFloat(document.getElementById('walkDistance').value) * 1000; // Convert to meters

    if (isNaN(walkDistance) || walkDistance <= 0) {
        alert('Please enter a valid walking distance.');
        return;
    }
    if(!document.getElementById('luck').value) {
        alert("Please enter luck vaue")
        return
    }
    let interval = setInterval(() => {
        distanceFromStartPoint += 50; // Simulate walking 70 meters per second
        let distanceToNextCryptid = nextCryptidAhead - (distanceFromStartPoint - lastCryptidEncounterValue);
        
        updateResults(distanceFromStartPoint, distanceToNextCryptid);
        updateProbalities(distanceFromStartPoint)
        const luck = parseFloat(document.getElementById('luck').value);
        if (distanceToNextCryptid <= 0) {
            const selectedCryptid = selectCryptid(distanceFromStartPoint / 1000, luck);
            addLog(selectedCryptid.name,distanceFromStartPoint)
            console.log(`Seçilen Cryptid: ${selectedCryptid.name}`);
            lastCryptidEncounterValue = distanceFromStartPoint;
             // HTML'e sonuçları ekle
            console.log("lastCryptidEncounterValue", lastCryptidEncounterValue);
        }

        if ((distanceFromStartPoint - lastUpdatedPoint) >= distanceRange) {
            lastUpdatedPoint = roundTo000(distanceFromStartPoint);
            console.log(lastUpdatedPoint);
            updateNextCryptidAhead();
        }

        if (distanceFromStartPoint >= walkDistance) {
            clearInterval(interval);
            alert('You have reached your walking distance.');
        }
    }, 1000);
});


// Sayfa yüklendiğinde başlangıç değerlerini göster / Show base values when the page loads
window.onload = displayBaseValues;

