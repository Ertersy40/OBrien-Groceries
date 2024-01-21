document.addEventListener('DOMContentLoaded', function () {
    fetchTransactions();
});

const names = {
    'Mr William Charles O': 'Will',
    'Ms Emily Maude O': "Em",
    'Mr Bryce Kotas': 'Bryce',
    'Lisal and Chuck O': 'Mum and Dad',
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

function displayTransactions(data) {
    const transactionsContainer = document.getElementById('transactions');
    transactionsContainer.innerHTML = ''; // Clear existing content
    console.log(data);

    // Initialize variables for total spend and date tracking
    let totalSpend = 0;
    let counts = {};

    // Find the start of the current week (most recent Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday
    startOfCurrentWeek.setHours(0, 0, 0, 0); // Set to beginning of the day

    // Assuming 'data' is an array of transactions as per the provided format
    data.forEach(transaction => {
        const settledAt = new Date(transaction.attributes.settledAt);
        const amount = parseFloat(transaction.attributes.amount.value);
        const sender = transaction.attributes.description;

        // Update total spend
        totalSpend += amount;

        // Update earliest and latest dates
        if (settledAt < earliestDate) earliestDate = settledAt;
        if (settledAt > latestDate) latestDate = settledAt;

        // Calculate contribution per person for the current week
        if (sender in names){
            if (settledAt >= startOfCurrentWeek) {
                if (sender in counts) {
                    counts[sender] += amount;
                } else {
                    counts[sender] = amount;
                }
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

    // Calculate the number of weeks between the earliest and latest dates
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeks = (latestDate - earliestDate) / millisecondsPerWeek;

    // Calculate the average spend per week
    const averageSpendPerWeek = totalSpend / weeks;

    // Log the average spend per week and spend per person for the current week
    console.log(`Average spend per week: $${averageSpendPerWeek.toFixed(2)}`);
    
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
        weekSpend[weekNumber] = (weekSpend[weekNumber] || 0) + amount;

        // Calculate contribution per person for the current week
        if (sender in names){
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
        if (amount >= requiredContribution) {
            statusElement.innerHTML = `<td><h2 class='has'><b>${name}</b></h2></td><td><div class="checkbox"><div class="tickLine1"></div><div class="tickLine2"></div></div></td>`;
        } else {
            statusElement.innerHTML = `<td><h2 class='hasNot'><b>${name}</b></h2></td><td><div class="checkbox"><div class="crossLine1"></div><div class="crossLine2"></div></div></td>`;
        }
        contributionStatusContainer.appendChild(statusElement);
    }
}