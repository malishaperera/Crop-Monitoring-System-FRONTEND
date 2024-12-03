$(document).ready(function () {
  const apiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/equipments";
  const fieldApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields";
  const staffApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs";

  let equipmentData = [];

  // Function to load all fields
  // Function to load all fields
  function loadFields() {
    $.ajax({
      url: fieldApiUrl,
      method: "GET",
      success: function (response) {
        const editFieldDropdown = $("#editFieldCode");
        const addFieldDropdown = $("#fieldCode"); // For Add New Form
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
      },
    });
  }

  // Function to load all staff members
  function loadStaffMembers() {
    $.ajax({
      url: staffApiUrl,
      method: "GET",
      success: function (response) {
        const editStaffDropdown = $("#editStaffMemberId");
        const addStaffDropdown = $("#staffMemberId"); // For Add New Form
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
      },
    });
  }

  // Function to render equipment cards
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
                            <!-- Delete Button -->
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                            
                            <!-- View Button -->
                            <button class="btn btn-success btn-sm view-btn" data-id="${equipment.equipmentId}" onclick="viewEquipment('${equipment.equipmentId}')">
                                <i class="bi bi-eye"></i> View
                            </button>
                            
                            <!-- Edit Button -->
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${equipment.equipmentId}" onclick="editEquipment('${equipment.equipmentId}')">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>
                        </div>
                    </div>
                </div>
            `;
      container.append(card);
    });
  }

  // Fetch all equipment from the backend
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
      },
    });
  }

  // Delete Equipment
  window.deleteEquipment = function (equipmentId) {
    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "DELETE",
      success: function () {
        alert("Equipment deleted successfully!");
        loadEquipments(); // Refresh the UI after deletion
      },
      error: function (xhr, status, error) {
        alert(`Error deleting equipment: ${xhr.responseText || error}`);
      },
    });
  };

  // View Equipment Function (populates modal with equipment details)
  window.viewEquipment = function (equipmentId) {
    // API endpoint for fetching individual equipment details
    const equipmentDetailsUrl = `${apiUrl}/${equipmentId}`;

    // Make an AJAX request to fetch the details of the equipment
    $.ajax({
      url: equipmentDetailsUrl,
      method: "GET",
      success: function (response) {
        // Assuming response contains the equipment details
        const equipment = response;

        // Populate modal with the equipment details
        const equipmentDetailsHtml = `
                    <p><strong>Equipment ID:</strong> ${equipment.equipmentId}</p>
                    <p><strong>Name:</strong> ${equipment.name}</p>
                    <p><strong>Type:</strong> ${equipment.equipmentType}</p>
                    <p><strong>Status:</strong> ${equipment.status}</p>
                    <p><strong>Field Code:</strong> ${equipment.fieldCode}</p>
                    <p><strong>Assigned to Staff:</strong> ${equipment.staffMemberId}</p>
                `;

        // Insert the HTML into the modal body
        $("#viewEquipmentDetails").html(equipmentDetailsHtml);

        // Show the modal
        $("#viewEquipmentModal").modal("show");
      },
      error: function (xhr, status, error) {
        alert(`Error fetching equipment details: ${xhr.responseText || error}`);
      },
    });
  };

  // Edit Equipment
  window.editEquipment = function (equipmentId) {
    const equipmentDetailsUrl = `${apiUrl}/${equipmentId}`;

    // Fetch the equipment details based on the ID
    $.ajax({
      url: equipmentDetailsUrl,
      method: "GET",
      success: function (response) {
        const equipment = response;

        // Populate the form in the Edit Modal
        $("#editName").val(equipment.name);
        $("#editEquipmentType").val(equipment.equipmentType);
        $("#editStatus").val(equipment.status);
        $("#editFieldCode").val(equipment.fieldCode);
        $("#editStaffMemberId").val(equipment.staffMemberId);

        // Store the equipmentId in the form data attribute for easy access when submitting
        $("#editEquipmentForm").data("equipmentId", equipment.equipmentId);

        // Show the Edit Modal
        $("#editEquipmentModal").modal("show");
      },
      error: function (xhr, status, error) {
        alert(`Error fetching equipment details: ${xhr.responseText || error}`);
      },
    });
  };

  // Submit updated equipment data
  $("#editEquipmentForm").submit(function (event) {
    event.preventDefault();

    const equipmentId = $(this).data("equipmentId"); // Get the equipmentId stored in the form
    const updatedEquipment = {
      name: $("#editName").val(),
      equipmentType: $("#editEquipmentType").val(),
      status: $("#editStatus").val(),
      fieldCode: $("#editFieldCode").val(),
      staffMemberId: $("#editStaffMemberId").val(),
    };

    $.ajax({
      url: `${apiUrl}/${equipmentId}`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify(updatedEquipment),
      success: function (response) {
        // Assuming the response contains the success message
        if (response && response.message === "Equipment saved successfully") {
          alert("Equipment updated successfully!");
          loadEquipments(); // Refresh equipment list
          $("#editEquipmentModal").modal("hide");
        } else {
          alert("Unexpected success response: " + JSON.stringify(response));
        }
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
  // Submit new equipment data
  $("#equipmentForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const newEquipment = {
      name: $("#name").val(),
      equipmentType: $("#equipmentType").val(),
      status: $("#status").val(),
      fieldCode: $("#fieldCode").val(),
      staffMemberId: $("#staffMemberId").val(),
    };

    $.ajax({
      url: apiUrl, // API URL for saving new equipment
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(newEquipment),
      success: function () {
        alert("Equipment added successfully!");
        loadEquipments(); // Refresh equipment list
        $("#addEquipmentModal").modal("hide"); // Close modal
        $("#equipmentForm")[0].reset(); // Reset the form
      },
      error: function (xhr, status, error) {
        alert(`Error adding equipment: ${xhr.responseText || error}`);
      },
    });
  });

  // Initial Load
  loadEquipments(); // Fetch equipment data
  loadFields(); // Load fields into dropdown
  loadStaffMembers(); // Load staff into dropdown
});
