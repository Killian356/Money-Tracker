// holds the db connection
let db;
// establish connection to idb called "budget_tracker" and set to version (1)
const request = indexedDB.open('budget_tracker', 1);
// this event will emit if the database version changes (nonexistent to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save reference to db
    const db = event.target.result;
    // creating data container(table) called "object store", we set the name and increment 
    db.createObjectStore('budget', { autoIncrement: true });
};

// upon success
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online 
    if(navigator.online) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};


// function attempts to submit data and there is no internet connection 
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['budget'], 'readwrite');

    // access object store for 'budget'
    const budgetObjectStore = transaction.objectStore('budget');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

// collect data from object store and 'post' it to the server
function uploadBudget() {
    // open a transaction on your db 
    const transaction = db.transaction(['budget'], 'readwrite');

    // access your object store 
    const budgetObjectStore = transaction.objectStore('budget');

    // get all records from store and set to a variable 
    const getAll = budgetObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there's data on indexedDB store, send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['budget'], 'readwrite');
                // access the 'budget' object store 
                const budgetObjectStore = transaction.objectStore('budget');
                // clear all items in your store
                budgetObjectStore.clear();

                alert('All saved transactions has been submitted!');
             })
             .catch(err => {
                 console.log(err);
             });
        }
    };
}

// listen for app coming back online 
window.addEventListener('online', uploadBudget);