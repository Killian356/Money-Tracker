// Creating Variable
let db;

// Establishing Database Location
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  // Saving Data Base Reference
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  // Database is created with object store
  db = event.target.result;
  if (navigator.onLine) {
  }
};

request.onerror = function (event) {
  // Error log Populates
  console.log(event.target.errorCode);
};

// Executes without Internet Accesss / Connection
function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_transaction");
  budgetObjectStore.add(record);
}

function uploadTransaction() {
  // Opens Ttransactions on Database
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_transaction");
  const getAll = budgetObjectStore.getAll();
  getAll.onsuccess = function () {
    // Any info in indexedDb's store sends to api server
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

// listens for Internet signal to reconnect
window.addEventListener("online", uploadTransaction);
