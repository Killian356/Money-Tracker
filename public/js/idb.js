let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new-transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadExpenses();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new-transaction'], 'readwrite');
  const moneyObjectStore = transaction.objectStore('new-transaction');
  moneyObjectStore.add(record);
}

// Function to upload transaction
function uploadExpenses() {
  const transaction = db.transaction(['new-transaction'], 'readwrite');
  const moneyObjectStore = transaction.objectStore('new-transaction');

  // get all records set to a variable
  const getAll = moneyObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['new-transaction'], 'readwrite');
          const moneyObjectStore = transaction.objectStore('new-transaction');
          moneyObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}
// Listen app coming back online/connecting
window.addEventListener('online', uploadExpenses);