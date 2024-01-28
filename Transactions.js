document.addEventListener('DOMContentLoaded', function () {
    fetchTransactions();
});

const names = {
    'Mr William Charles O': 'Will',
    "EMILY O'BRIEN": "Em & Bryce",
    "C D O'BRIEN & L J DO": 'Mum & Dad',
}

function fetchTransactions() {
    fetch('https://secure-garden-42141-74fb08bc459f.herokuapp.com/api/transactions')
        .then(response => response.json())
        .then(data => {
            displayTransactions(data)
        // Process and display your data here
        })
        .catch(error => console.error('Error:', error));
  
}

function getStartOfWeek(date) {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

function displayTransactions(data) {
    const transactionsContainer = document.getElementById('transactions');
    const contributionStatusContainer = document.getElementById('contributionStatus');
    const weeklySpendValue = document.getElementById('weeklySpend');
    transactionsContainer.innerHTML = ''; // Clear existing content
    contributionStatusContainer.innerHTML = ''; // Clear existing content for contribution status

    let counts = {};
    let weekSpend = {};
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysPerWeek = 7;
    const requiredContribution = 50

    for (const name in names) {
        counts[names[name]] = 0;
    }

    // Find the start of the current week (most recent Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday
    startOfCurrentWeek.setHours(0, 0, 0, 0); // Set to beginning of the day

    const startOfFirstWeek = getStartOfWeek(new Date(data[0].attributes.settledAt));

    data.forEach(transaction => {
        const settledAt = new Date(transaction.attributes.settledAt);
        const amount = parseFloat(transaction.attributes.amount.value);
        const sender = transaction.attributes.description;

        // Determine the start of the week for the transaction
        const startOfWeek = getStartOfWeek(settledAt);
        const weekNumber = Math.floor((startOfWeek - startOfFirstWeek) / (millisecondsPerDay * daysPerWeek));

        // Update spend per week
        if (amount < 0){
            weekSpend[weekNumber] = (weekSpend[weekNumber] || 0) + (amount * -1);
        }

        // Calculate contribution per person for the current week
        if (sender in names){
            // console.log(`amount: ${amount}, settled at: ${settledAt}, start of week:${startOfCurrentWeek}`)
            // console.log('logically, settledAt >= startOfCurrentWeek', (settledAt >= startOfCurrentWeek))
            if (settledAt >= startOfCurrentWeek) {
                counts[names[sender]] = (counts[names[sender]] || 0) + amount
            }
        }

        // Create transaction element
        const transactionElement = document.createElement('div');
        transactionElement.innerHTML = `
            <div class="transactionLine">
                <p class="sender">${sender}</p>
                <p class="amount">$${amount.toFixed(2)}</p>
            </div>
            <p class="description">${transaction.attributes.message}</p>
        `;
        transactionsContainer.appendChild(transactionElement);
    });

    // Calculate the average spend per week
    const numberOfWeeks = Object.keys(weekSpend).length;
    const totalWeeklySpend = Object.values(weekSpend).reduce((a, b) => a + b, 0);
    const averageSpendPerWeek = totalWeeklySpend / numberOfWeeks;

    // Log the average spend per week
    weeklySpendValue.textContent = `$${averageSpendPerWeek}`

    // After processing all transactions, check if each person has met their contribution
    for (const [name, amount] of Object.entries(counts)) {
        const statusElement = document.createElement('tr');
        // console.log(`name: ${name}, amount: ${amount}`)
        // console.log('name != Will && amount >= requiredContribution * 2', (name != 'Will' && amount >= requiredContribution * 2))
        if ((name == 'Will' && amount >= requiredContribution) || (name != 'Will' && amount >= requiredContribution * 2)){
            statusElement.innerHTML = `<td><h2 class='has'><b>${name}</b></h2></td><td><div class="checkbox"><div class="tickLine1"></div><div class="tickLine2"></div></div></td>`;
        } else {
            statusElement.innerHTML = `<td><h2 class='hasNot'><b>${name}</b></h2></td><td><div class="checkbox"><div class="crossLine1"></div><div class="crossLine2"></div></div></td>`;
        }
        contributionStatusContainer.appendChild(statusElement);
    }
}