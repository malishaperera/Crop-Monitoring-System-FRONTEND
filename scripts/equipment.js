$(document).ready(function () {
  // API Endpoints
  const apiUrl = "http://localhost:5055/cropmonitoringcollector/api/v1/equipments";
  const fieldApiUrl = "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields";
  const staffApiUrl = "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs";

  // Retrieve token from localStorage
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("You are not authenticated. Redirecting to login page.");
    window.location.href = "login.html"; // Redirect if no token is found
    return;
  }

  // Configure default AJAX settings to include the Authorization header
  $.ajaxSetup({
    headers: {
      Authorization: `Bearer ${token}` // Attach token to all requests
    }
  });

  let equipmentData = []; // Store equipment data locally

  // Function to load all fields into dropdown menus
  function loadFields() {
    $.ajax({
      url: fieldApiUrl,
      method: "GET",
      success: function (response) {
        const editFieldDropdown = $("#editFieldCode");
        const addFieldDropdown = $("#fieldCode");
        editFieldDropdown.empty();
        addFieldDropdown.empty();

        response.forEach((field) => {
          const option = new Option(field.fieldCode, field.fieldCode);
          editFieldDropdown.append(option);
          addFieldDropdown.append(option.cloneNode(true)); // Clone for Add Form
        });
      },
      error: function (xhr, status, error) {
        alert(`Error loading fields: ${xhr.responseText || error}`);
      }
    });
  }

  // Function to load all staff members into dropdown menus
  function loadStaffMembers() {
    $.ajax({
      url: staffApiUrl,
      method: "GET",
      success: function (response) {
        const editStaffDropdown = $("#editStaffMemberId");
        const addStaffDropdown = $("#staffMemberId");
        editStaffDropdown.empty();
        addStaffDropdown.empty();

        response.forEach((staff) => {
          const option = new Option(staff.staffMemberId, staff.staffMemberId);
          editStaffDropdown.append(option);
          addStaffDropdown.append(option.cloneNode(true)); // Clone for Add Form
        });
      },
      error: function (xhr, status, error) {
        alert(`Error loading staff members: ${xhr.responseText || error}`);
      }
    });
  }

  // Function to render equipment cards on the page
  function renderEquipmentCards() {
    const container = $("#equipment-cards-container");
    container.empty(); // Clear existing cards

    equipmentData.forEach((equipment) => {
      const card = `
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${equipment.name}</h5>
              <p class="card-text">Type: ${equipment.equipmentType}</p>
              <p class="card-text">Status: ${equipment.status}</p>
              <p class="card-text">Field Code: ${equipment.fieldCode}</p>
              <p class="card-text">Assigned to Staff: ${equipment.staffMemberId}</p>
              <p class="card-text">Equipment ID: ${equipment.equipmentId}</p>
            </div>
            <div class="card-footer text-end">
              <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
              <button class="btn btn-success btn-sm" onclick="viewEquipment('${equipment.equipmentId}')">View</button>
              <button class="btn btn-primary btn-sm" onclick="editEquipment('${equipment.equipmentId}')">Edit</button>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });
  }

  // Function to fetch all equipment from the backend
  function loadEquipments() {
    $.ajax({
      url: `${apiUrl}/allEquipments`,
      method: "GET",
      success: function (response) {
        equipmentData = response;
        renderEquipmentCards();
      },
      error: function (xhr, status, error) {
        alert(`Error loading equipments: ${xhr.responseText || error}`);
      }
    });
  }

  // Function to delete equipment by ID
  window.deleteEquipment = function (equipmentId) {
    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "DELETE",
      success: function () {
        alert("Equipment deleted successfully!");
        loadEquipments();
      },
      error: function (xhr, status, error) {
        alert(`Error deleting equipment: ${xhr.responseText || error}`);
      }
    });
  };

  // Function to view equipment details in a modal
  window.viewEquipment = function (equipmentId) {
    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "GET",
      success: function (response) {
        const equipmentDetailsHtml = `
          <p><strong>Equipment ID:</strong> ${response.equipmentId}</p>
          <p><strong>Name:</strong> ${response.name}</p>
          <p><strong>Type:</strong> ${response.equipmentType}</p>
          <p><strong>Status:</strong> ${response.status}</p>
          <p><strong>Field Code:</strong> ${response.fieldCode}</p>
          <p><strong>Assigned to Staff:</strong> ${response.staffMemberId}</p>
        `;
        $("#viewEquipmentDetails").html(equipmentDetailsHtml);
        $("#viewEquipmentModal").modal("show");
      },
      error: function (xhr, status, error) {
        alert(`Error fetching equipment details: ${xhr.responseText || error}`);
      }
    });
  };

  // Function to edit equipment by fetching details and populating the form
  window.editEquipment = function (equipmentId) {
    const equipmentDetailsUrl = `${apiUrl}/${equipmentId}`;
    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "GET",
      success: function (response) {
        $("#editName").val(response.name);
        $("#editEquipmentType").val(response.equipmentType);
        $("#editStatus").val(response.status);
        $("#editFieldCode").val(response.fieldCode);
        $("#editStaffMemberId").val(response.staffMemberId);
        $("#editEquipmentForm").data("equipmentId", response.equipmentId);
        $("#editEquipmentModal").modal("show");
      },
      error: function (xhr, status, error) {
        alert(`Error fetching equipment details: ${xhr.responseText || error}`);
      }
    });
  };

  // Submit handler for editing equipment
  $("#editEquipmentForm").submit(function (event) {
    event.preventDefault();
    const equipmentId = $(this).data("equipmentId");
    const updatedEquipment = {
      name: $("#editName").val(),
      equipmentType: $("#editEquipmentType").val(),
      status: $("#editStatus").val(),
      fieldCode: $("#editFieldCode").val(),
      staffMemberId: $("#editStaffMemberId").val()
    };

    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify(updatedEquipment),
      success: function () {
        alert("Equipment updated successfully!");
        loadEquipments();
        $("#editEquipmentModal").modal("hide");
      },
      error: function (xhr, status, error) {
        alert(`Error updating equipment: ${xhr.responseText || error}`);
      },
      error: function (xhr, status, error) {
        // Log the response in case of error
        console.error(
          "Error updating equipment:",
          xhr.status,
          xhr.responseText,
          error
        );
        alert(`Error updating equipment: ${xhr.responseText || error}`);
      },
    });
  });

  // Submit handler for adding new equipment
  $("#equipmentForm").submit(function (event) {
    event.preventDefault();
    const newEquipment = {
      name: $("#name").val(),
      equipmentType: $("#equipmentType").val(),
      status: $("#status").val(),
      fieldCode: $("#fieldCode").val(),
      staffMemberId: $("#staffMemberId").val()
    };

    $.ajax({
      url: apiUrl,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(newEquipment),
      success: function () {
        alert("Equipment added successfully!");
        loadEquipments();
        $("#addEquipmentModal").modal("hide");
        $("#equipmentForm")[0].reset();
      },
      error: function (xhr, status, error) {
        alert(`Error adding equipment: ${xhr.responseText || error}`);
      }
    });
  });

  // Initial load
  loadEquipments();
  loadFields();
  loadStaffMembers();
});
