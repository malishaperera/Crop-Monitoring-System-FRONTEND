// Function to get the JWT token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Function to fetch and display all staff data
async function loadStaffData() {
  const token = getAuthToken();
  if (!token) {
    alert("You are not authorized. Please log in again.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch staff data");
    }

    const staffList = await response.json();
    const container = document.getElementById("staff-cards-container");

    // Clear existing content
    container.innerHTML = "";

    // Iterate through staff data and create cards
    staffList.forEach((staff) => {
      const staffCard = document.createElement("div");
      staffCard.classList.add("col");
      staffCard.innerHTML = `
        <div class="card shadow-sm">
          <img src="../image/staff-imge/staff-1.jpg" class="card-img-top" alt="${staff.firstName} ${staff.lastName}" />
          <div class="card-body">
            <h5 class="card-title">${staff.firstName} ${staff.lastName}</h5>
            <p class="card-text">
              <strong>Designation:</strong> ${staff.designation} <br />
              <strong>Role:</strong> ${staff.role} <br />
              <strong>Gender:</strong> ${staff.gender} <br />
              <strong>Joined:</strong> ${staff.joinedDate} <br />
              <strong>Date of Birth:</strong> ${staff.DOB} <br />
              <strong>Contact:</strong> ${staff.contactNo} <br />
              <strong>Email:</strong> ${staff.email} <br />
              <strong>Address:</strong> ${[
                staff.addressLine1,
                staff.addressLine2,
                staff.addressLine3,
                staff.addressLine4,
                staff.addressLine5,
              ]
                .filter((line) => line)
                .join(", ")}
            </p>
            <!-- Buttons Row -->
            <div class="card-footer">
              <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-primary view-btn" onclick="viewStaffDetails('${
                  staff.staffMemberId
                }')">View</button>
                <button class="btn btn-sm btn-warning edit-btn" onclick="editStaffDetails('${
                  staff.staffMemberId
                }')">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="deleteStaff('${
                  staff.staffMemberId
                }')">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(staffCard);
    });
  } catch (error) {
    console.error("Error loading staff data:", error);
    alert("Failed to load staff data. Please try again later.");
  }
}

// Handle form submission for adding or updating staff
document
  .getElementById("staffForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const staffMemberId = document
      .getElementById("staffForm")
      .getAttribute("data-editing");
    const staffData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      designation: document.getElementById("designation").value,
      role: document.getElementById("role").value,
      gender: document.getElementById("gender").value,
      joinedDate: document.getElementById("joinedDate").value,
      DOB: document.getElementById("dob").value,
      addressLine1: document.getElementById("addressLine1").value,
      addressLine2: document.getElementById("addressLine2").value,
      addressLine3: document.getElementById("addressLine3").value,
      addressLine4: document.getElementById("addressLine4").value,
      addressLine5: document.getElementById("addressLine5").value,
      contactNo: document.getElementById("contactNo").value,
      email: document.getElementById("email").value,
    };

    const token = getAuthToken();
    if (!token) {
      alert("You are not authorized. Please log in again.");
      return;
    }

    try {
      let response;
      if (staffMemberId) {
        // Update existing staff (PATCH request)
        response = await fetch(
          `http://localhost:5055/cropmonitoringcollector/api/v1/staffs/${staffMemberId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(staffData),
          }
        );
      } else {
        // Add new staff (POST request)
        response = await fetch(
          "http://localhost:5055/cropmonitoringcollector/api/v1/staffs",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(staffData),
          }
        );
      }

      if (response.ok) {
        await loadStaffData(); // Reload staff data

        // Reset the form and hide the modal
        bootstrap.Modal.getInstance(
          document.getElementById("addStaffModal")
        ).hide();
        document.getElementById("staffForm").reset();
        document.getElementById("staffForm").removeAttribute("data-editing"); // Clear editing ID

        alert(
          staffMemberId
            ? "Staff updated successfully!"
            : "Staff added successfully!"
        );
      } else {
        alert("Failed to save staff. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });

// Load staff data when the page loads
document.addEventListener("DOMContentLoaded", loadStaffData);

// View staff details function
async function viewStaffDetails(staffMemberId) {
  const token = getAuthToken();
  if (!token) {
    alert("You are not authorized. Please log in again.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/staffs/${staffMemberId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch staff details");
    }

    const staff = await response.json();

    // Populate the modal with staff details
    document.getElementById("viewStaffMemberId").value = staff.staffMemberId;
    document.getElementById("viewFirstName").value = staff.firstName;
    document.getElementById("viewLastName").value = staff.lastName;
    document.getElementById("viewDesignation").value = staff.designation;
    document.getElementById("viewRole").value = staff.role;
    document.getElementById("viewGender").value = staff.gender;
    document.getElementById("viewJoinDate").value = staff.joinedDate;
    document.getElementById("viewDob").value = staff.DOB;
    document.getElementById("viewContactNo").value = staff.contactNo;
    document.getElementById("viewEmail").value = staff.email;
    document.getElementById("viewAddress").value = [
      staff.addressLine1,
      staff.addressLine2,
      staff.addressLine3,
      staff.addressLine4,
      staff.addressLine5,
    ]
      .filter((line) => line)
      .join(", ");

    // Show the modal
    const modal = new bootstrap.Modal(
      document.getElementById("viewStaffModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error fetching staff details:", error);
    alert("Failed to load staff details. Please try again later.");
  }
}

// Edit staff details function
async function editStaffDetails(staffMemberId) {
  const token = getAuthToken();
  if (!token) {
    alert("You are not authorized. Please log in again.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/staffs/${staffMemberId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch staff details for editing");
    }

    const staff = await response.json();

    // Format the joinedDate to YYYY-MM-DD
    const formattedJoinedDate = staff.joinedDate.split("T")[0];

    // Populate the form with staff details for editing
    const form = document.getElementById("staffForm");
    form.setAttribute("data-editing", staffMemberId); // Set the editing ID

    document.getElementById("firstName").value = staff.firstName;
    document.getElementById("lastName").value = staff.lastName;
    document.getElementById("designation").value = staff.designation;
    document.getElementById("role").value = staff.role;
    document.getElementById("gender").value = staff.gender;
    document.getElementById("joinedDate").value = formattedJoinedDate;
    document.getElementById("dob").value = staff.DOB;
    document.getElementById("contactNo").value = staff.contactNo;
    document.getElementById("email").value = staff.email;
    document.getElementById("addressLine1").value = staff.addressLine1;
    document.getElementById("addressLine2").value = staff.addressLine2;
    document.getElementById("addressLine3").value = staff.addressLine3;
    document.getElementById("addressLine4").value = staff.addressLine4;
    document.getElementById("addressLine5").value = staff.addressLine5;

    // Show the modal for editing
    const modal = new bootstrap.Modal(
      document.getElementById("addStaffModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error fetching staff for editing:", error);
    alert("Failed to fetch staff details for editing. Please try again later.");
  }
}

// Delete staff function
async function deleteStaff(staffMemberId) {
  const token = getAuthToken();
  if (!token) {
    alert("You are not authorized. Please log in again.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this staff?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/staffs/${staffMemberId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Staff deleted successfully!");
      loadStaffData(); // Reload staff data after deletion
    } else {
      alert("Failed to delete staff. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting staff:", error);
    alert("An error occurred while deleting staff. Please try again later.");
  }
}
