// Function to get the authentication token
function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("User not authenticated. Redirecting to login page...");
    window.location.href = "/login.html";
    return null;
  }
  return token;
}

// Load users from the API
function loadUsersFromAPI() {
  const token = getAuthToken();
  if (!token) return;

  fetch("http://localhost:5055/cropmonitoringcollector/api/v1/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((users) => populateUserTable(users))
    .catch((error) => console.error("Error loading users:", error));
}

// Populate the user table
function populateUserTable(users) {
  const tableBody = document.getElementById("userTableBody");
  tableBody.innerHTML = ""; // Clear table

  users.forEach((user) => {
    const row = `
      <tr>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.staffMemberId || "N/A"}</td>
        <td>
          <button class="btn btn-primary edit-btn" data-user='${JSON.stringify(user)}'>
            <i class="bi bi-pencil-square"></i> Edit
          </button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  // Attach event listeners to edit buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const user = JSON.parse(button.getAttribute("data-user"));
      openEditModal(user);
    });
  });
}

// Open the edit modal with user data
function openEditModal(user) {
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;
  document.getElementById("password").value = ""; 

  const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
  modal.show();
}

// Submit the edit form to update user details
// Submit the edit form to update user details
document.getElementById("editUserForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("editEmail").value;
  const role = document.getElementById("editRole").value;
  const password = document.getElementById("password").value;
  const token = getAuthToken();

  if (!token) return;

  // Create FormData object
  const formData = new FormData();
  formData.append("email", email);
  formData.append("role", role);
  if (password) {
    formData.append("password", password);
  }

  fetch(`http://localhost:5055/cropmonitoringcollector/api/v1/users/${email}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to update user");
      alert("User updated successfully!");
      loadUsersFromAPI();
    })
    .catch((error) => console.error("Error updating user:", error));
});


// Initialize the page
loadUsersFromAPI();
