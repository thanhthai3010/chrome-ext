chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "insert_success") {
    if (request.payload) {
      document
        .querySelectorAll(".add_rec_input")
        .forEach((el) => (el.value = ""));
    }
  } else if (request.message === "get_success") {
    if (request.payload) {
      document
        .querySelectorAll(".updated-details")
        .forEach((el) => (el.style.display = "none"));
      document
        .querySelectorAll(".search-label")
        .forEach((el) => (el.style.display = ""));
      document
        .querySelectorAll(".details")
        .forEach((el) => (el.style.display = ""));
      document.getElementById("delete-record").style.display = "";
      document.getElementById("edit-record").style.display = "";

      // change "Save Changes" to "Edit Record"
      document.getElementById("edit-record").innerText = "Edit Record";

      document.getElementById("details-name").innerText = request.payload.name;
      document.getElementById("details-dob").innerText = request.payload.dob;
      document.getElementById("details-email").innerText =
        request.payload.email;
    } else {
      console.log("No record found.");
    }
  } else if (request.message === "update_success") {
    if (request.payload) {
      document.getElementById("edit-record").innerText = "Changes saved...";

      setTimeout(() => {
        // enable button
        document.getElementById("edit-record").disabled = false;
        // change "Save Changes" to "Edit Record"
        document.getElementById("edit-record").innerText = "Edit Record";
        // show 'delete record' button
        document.getElementById("delete-record").style.display = "";
      }, 1500);

      // hide input details elements
      document
        .querySelectorAll(".updated-details")
        .forEach((el) => (el.style.display = "none"));

      // show span details elements
      document
        .querySelectorAll(".details")
        .forEach((el) => (el.style.display = ""));
      document.getElementById("details-name").innerText =
        document.getElementById("update-name").value;
      document.getElementById("details-dob").innerText =
        document.getElementById("update-dob").value;
    }
  } else if (request.message === "delete_success") {
    if (request.payload) {
      document
        .querySelectorAll(".search-label")
        .forEach((el) => (el.style.display = "none"));
      document
        .querySelectorAll(".updated-details")
        .forEach((el) => (el.style.display = "none"));
      document
        .querySelectorAll(".details")
        .forEach((el) => (el.style.display = "none"));
      document.getElementById("delete-record").style.display = "none";
      document.getElementById("edit-record").style.display = "none";
    }
  }
});

// hide details of search results, delete button, edit text fields
document
  .querySelectorAll(".search-label")
  .forEach((el) => (el.style.display = "none"));
document
  .querySelectorAll(".updated-details")
  .forEach((el) => (el.style.display = "none"));
document
  .querySelectorAll(".details")
  .forEach((el) => (el.style.display = "none"));
document.getElementById("delete-record").style.display = "none";
document.getElementById("edit-record").style.display = "none";

// ADD A RECORD
document.getElementById("add_form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form_data = new FormData(document.getElementById("add_form"));

  chrome.runtime.sendMessage({
    message: "insert",
    payload: [
      {
        name: form_data.get("name"),
        dob: form_data.get("dob"),
        email: form_data.get("email"),
      },
    ],
  });
});

// SEARCH FOR A RECORD
document
  .getElementById("search_for_record")
  .addEventListener("click", (event) => {
    event.preventDefault();

    let search_term = document.getElementById("search_term").value;

    chrome.runtime.sendMessage({
      message: "get",
      payload: search_term,
    });
  });

// EDIT AND SAVE A RECORD
document.getElementById("edit-record").addEventListener("click", (event) => {
  event.preventDefault();

  if (document.getElementById("edit-record").innerText === "Edit Record") {
    // hide span details elements
    document
      .querySelectorAll(".details")
      .forEach((el, i) => (i != 2 ? (el.style.display = "none") : null));

    // show input details elements
    document
      .querySelectorAll(".updated-details")
      .forEach((el) => (el.style.display = ""));

    document.getElementById("update-name").value =
      document.getElementById("details-name").innerText;
    document.getElementById("update-dob").value =
      document.getElementById("details-dob").innerText;

    // change edit button text
    document.getElementById("edit-record").innerText = "Save Changes";
    // hide 'delete record' button
    document.getElementById("delete-record").style.display = "none";
  } else if (
    document.getElementById("edit-record").innerText === "Save Changes"
  ) {
    // disable save button
    document.getElementById("edit-record").disabled = true;

    chrome.runtime.sendMessage({
      message: "update",
      payload: {
        name: document.getElementById("update-name").value,
        dob: document.getElementById("update-dob").value,
        email: document.getElementById("details-email").innerText,
      },
    });
  }
});

// DELETE A RECORD
document.getElementById("delete-record").addEventListener("click", (event) => {
  event.preventDefault();

  chrome.runtime.sendMessage({
    message: "delete",
    payload: document.getElementById("details-email").innerText,
  });
});
