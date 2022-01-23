// create variable
let db;

// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open("moneytracker_budget", 1);

request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_transaction");
  budgetObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_transaction");
  const getAll = budgetObjectStore.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_transaction"], "readwrite");
          re;
          const budgetObjectStore = transaction.objectStore("new_transaction");
          budgetObjectStore.clear();
          alert("All saved transactions has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadTransaction);
