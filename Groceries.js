document.addEventListener('DOMContentLoaded', function () {
    fetchGroceryList();
});

function fetchGroceryList() {
    fetch('https://secure-garden-42141-74fb08bc459f.herokuapp.com/api/grocery-list')
        .then(response => response.text()) // Handle as text instead of JSON
        .then(data => {
            const items = data.split('\n').filter(item => item); // Split the text by new lines and filter out empty lines
            displayGroceryList(items);
        })
        .catch(error => console.error('Error:', error));
}


function displayGroceryList(items) {
    const groceryListContainer = document.getElementById('grocery-list');
    groceryListContainer.innerHTML = ''; // Clear existing content

    items.forEach((item, index) => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'item-' + index;
        checkbox.addEventListener('change', (event) => handleCheckboxChange(event, item));

        const label = document.createElement('label');
        label.htmlFor = 'item-' + index;
        label.textContent = item;

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        groceryListContainer.appendChild(listItem);
    });
}

function handleCheckboxChange(event) {
    const label = event.target.nextSibling;
    if (event.target.checked) {
        label.style.textDecoration = 'line-through';
    } else {
        label.style.textDecoration = 'none';
    }
}

function removeCheckedItems() {
    const checkedCheckboxes = document.querySelectorAll('#grocery-list input[type="checkbox"]:checked');
    const itemsToRemove = Array.from(checkedCheckboxes).map(checkbox => checkbox.nextSibling.textContent);

    fetch('https://secure-garden-42141-74fb08bc459f.herokuapp.com/api/remove-grocery-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToRemove })
    })
    .then(response => response.text())
    .then(() => {
        fetchGroceryList(); // Refresh the list
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('remove-checked-btn').addEventListener('click', removeCheckedItems);


document.getElementById('add-grocery-btn').addEventListener('click', function() {
    const item = document.getElementById('grocery-input').value;
    addGroceryItem(item);
    document.getElementById('grocery-input').value = ''; // Clear the input field
});

function addGroceryItem(item) {
    fetch('https://secure-garden-42141-74fb08bc459f.herokuapp.com/api/grocery-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: item })
    })
    .then(response => response.text())
    .then(() => {
        fetchGroceryList(); // Refresh the list
    })
    .catch(error => console.error('Error:', error));
}