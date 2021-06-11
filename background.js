// chrome.browserAction.onClicked.addListener(function (tab) {
//   // Send a message to the active tab
//   // Need to be modified
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     var activeTab = tabs[0];
//     chrome.tabs.sendMessage(activeTab.id, {
//       message: "clicked_browser_action",
//     });
//   });
// });

// // This block is new!
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.message === "open_new_tab") {
//     chrome.tabs.create({ url: request.url });
//   }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "insert") {
    console.log("I'm inserting: ", request.payload);
    let insertResponse = insert_records(request.payload);

    insertResponse.then((res) => {
      chrome.runtime.sendMessage({
        message: "insert_success",
        payload: res,
      });
    });
  }
});

let roster = [
  {
    name: "A",
    dob: "22/01/2021",
    email: "test@gmail.com",
  },
  {
    name: "B",
    dob: "26/12/2021",
    email: "example@gmail.com",
  },
  {
    name: "C",
    dob: "18/08/2021",
    email: "value@gmail.com",
  },
];

let db = null;
create_database();
function create_database() {
  const request = window.indexedDB.open("MyTestDB");
  request.onerror = function (event) {
    console.log("Problem opening DB.", event);
  };
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    let objectStore = db.createObjectStore("roster", {
      keyPath: "email",
    });
    objectStore.transaction.oncomplete = function (event) {
      console.log("ObjectStore Created.", event);
    };
  };
  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("DB OPENED.");
    insert_records(roster);
    db.onerror = function (event) {
      console.log("FAILED TO OPEN DB.", event);
    };
  };
}

function insert_records(records) {
  if (db) {
    const insert_transaction = db.transaction("roster", "readwrite");
    const objectStore = insert_transaction.objectStore("roster");
    return new Promise((resolve, reject) => {
      insert_transaction.oncomplete = function () {
        console.log("ALL INSERT TRANSACTIONS COMPLETE.");
        resolve(true);
      };
      insert_transaction.onerror = function () {
        console.log("PROBLEM INSERTING RECORDS.", reject);
        resolve(false);
      };
      records.forEach((person) => {
        let request = objectStore.add(person);
        request.onsuccess = function () {
          console.log("Added: ", person);
        };
      });
    });
  }
}

function get_record(email) {
  if (db) {
    const get_transaction = db.transaction("roster", "readonly");
    const objectStore = get_transaction.objectStore("roster");
    return new Promise((resolve, reject) => {
      get_transaction.oncomplete = function () {
        console.log("ALL GET TRANSACTIONS COMPLETE.");
      };
      get_transaction.onerror = function () {
        console.log("PROBLEM GETTING RECORDS.");
      };
      let request = objectStore.get(email);
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
    });
  }
}
function update_record(record) {
  if (db) {
    const put_transaction = db.transaction("roster", "readwrite");
    const objectStore = put_transaction.objectStore("roster");
    return new Promise((resolve, reject) => {
      put_transaction.oncomplete = function () {
        console.log("ALL PUT TRANSACTIONS COMPLETE.");
        resolve(true);
      };
      put_transaction.onerror = function () {
        console.log("PROBLEM UPDATING RECORDS.");
        resolve(false);
      };
      objectStore.put(record);
    });
  }
}
function delete_record(email) {
  if (db) {
    const delete_transaction = db.transaction("roster", "readwrite");
    const objectStore = delete_transaction.objectStore("roster");
    return new Promise((resolve, reject) => {
      delete_transaction.oncomplete = function () {
        console.log("ALL DELETE TRANSACTIONS COMPLETE.");
        resolve(true);
      };
      delete_transaction.onerror = function () {
        console.log("PROBLEM DELETE RECORDS.");
        resolve(false);
      };
      objectStore.delete(email);
    });
  }
}
