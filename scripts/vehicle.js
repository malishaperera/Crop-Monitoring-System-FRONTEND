$(document).ready(function () {

  let vehiclCODE ;
  // API endpoints
  const vehicleApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/allVehicles";
  const staffApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs";

  // Fetch and populate staff data in the "Staff Member ID" dropdown
  $.ajax({
    url: staffApiUrl,
    method: "GET",
    dataType: "json",
    success: function (staffData) {
      const staffDropdown = $("#staffMemberId");
      staffDropdown.empty(); // Clear any existing options
      staffData.forEach((staff) => {
        staffDropdown.append(
          `<option value="${staff.staffMemberId}">${staff.staffMemberId}</option>`
        );
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching staff data:", error);
    },
  });

  // Load vehicle data into the table
  function loadVehicleData() {
    $.ajax({
      url: vehicleApiUrl,
      method: "GET",
      dataType: "json",
      success: function (vehicleData) {
        const tableBody = $("#vehicleTable tbody");
        tableBody.empty(); // Clear existing rows if any
        vehicleData.forEach((vehicle) => {
          tableBody.append(`
            <tr>
              <td>${vehicle.vehicleCode}</td>
              <td>${vehicle.licensePlateNumber}</td>
              <td>${vehicle.vehicleCategory}</td>
              <td>${vehicle.fuelType}</td>
              <td>${vehicle.status}</td>
              <td>${vehicle.remarks}</td>
              <td>${vehicle.staffMemberId}</td>
              <td>
                <button class="btn btn-info btn-sm view-btn" data-id="${vehicle.vehicleCode}">View</button>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${vehicle.vehicleCode}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${vehicle.vehicleCode}">Delete</button>
              </td>
            </tr>
          `);
        });

        // Initialize button functionalities
        initializeViewButtons();
        initializeEditButtons();
        initializeDeleteButtons();
      },
      error: function (xhr, status, error) {
        console.error("Error fetching vehicle data:", error);
      },
    });
  }

  // Initialize View buttons
  function initializeViewButtons() {
    $(".view-btn").click(function () {
      const vehicleCode = $(this).data("id");
      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/${vehicleCode}`,
        method: "GET",
        dataType: "json",
        success: function (vehicleDetails) {
          if (vehicleDetails) {
            // Populate the modal with vehicle details
            $("#viewLicensePlateNumber").val(vehicleDetails.licensePlateNumber);
            $("#viewVehicleCategory").val(vehicleDetails.vehicleCategory);
            $("#viewFuelType").val(vehicleDetails.fuelType);
            $("#viewStatus").val(vehicleDetails.status);
            $("#viewRemarks").val(vehicleDetails.remarks);
            $("#viewStaffMemberId").val(vehicleDetails.staffMemberId);
            $("#viewVehicleModal").modal("show");
          } else {
            alert("Vehicle details not found!");
          }
        },
        error: function (xhr, status, error) {
          console.error("Error fetching vehicle details:", error);
          alert("Failed to fetch vehicle details.");
        },
      });
    });
  }

  
  // Initialize Edit buttons
  function initializeEditButtons() {
    $(".edit-btn").click(function () {
      const vehicleCode = $(this).data("id");
      console.log("Edit Button Clicked for Vehicle Code: ", vehicleCode); // Debugging line
  
      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/${vehicleCode}`,
        method: "GET",
        dataType: "json",
        success: function (vehicleDetails) {
          if (vehicleDetails) {
            console.log("Vehicle details fetched:", vehicleDetails); // Debugging line
  
            // Populate modal fields
            $("#vehicleCode").val(vehicleDetails.vehicleCode); // Set vehicleCode in hidden input
            $("#licensePlateNumber").val(vehicleDetails.licensePlateNumber);
            $("#vehicleCategory").val(vehicleDetails.vehicleCategory);
            $("#fuelType").val(vehicleDetails.fuelType);
            $("#status").val(vehicleDetails.status);
            $("#remarks").val(vehicleDetails.remarks);
            $("#staffMemberId").val(vehicleDetails.staffMemberId);
  
            // Change modal title and button text for editing
            $("#addVehicleModalLabel").text("Edit Vehicle");
            $("#saveVehicle")
              .text("Update Vehicle")
              .attr("id", "updateVehicle");
  
            // Show the modal
            $("#addVehicleModal").modal("show");
          } else {
            alert("Vehicle details not found!");
          }
        },
        error: function (xhr, status, error) {
          console.error("Error fetching vehicle details for edit:", error);
          alert("Failed to load vehicle details.");
        },
      });
    });
  }
  

  // Initialize Delete buttons
  function initializeDeleteButtons() {
    $(".delete-btn").click(function () {
      const vehicleCode = $(this).data("id");
      if (confirm("Are you sure you want to delete this vehicle?")) {
        const button = $(this);
        $.ajax({
          url: `http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/${vehicleCode}`,
          method: "DELETE",
          success: function (response) {
            alert("Vehicle deleted successfully!");
            button.closest("tr").remove();
          },
          error: function (xhr, status, error) {
            console.error("Error deleting vehicle:", error);
            alert("Failed to delete vehicle.");
          },
        });
      }
    });
  }

  $(document).on("click", "#saveVehicle, #updateVehicle", function () {
    const isUpdate = $(this).attr("id") === "updateVehicle";
    const vehicleCode = $("#vehicleCode").val(); // Get vehicleCode for updates
  
    const vehicleData = {
      licensePlateNumber: $("#licensePlateNumber").val(),
      vehicleCategory: $("#vehicleCategory").val(),
      fuelType: $("#fuelType").val(),
      status: $("#status").val(),
      remarks: $("#remarks").val(),
      staffMemberId: $("#staffMemberId").val(),
    };
  
    const requestUrl = isUpdate
      ? `http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/${vehicleCode}`
      : "http://localhost:5055/cropmonitoringcollector/api/v1/vehicles";
    const requestMethod = isUpdate ? "PATCH" : "POST";
  
    console.log("Sending request to:", requestUrl);
    console.log("Request method:", requestMethod);
    console.log("Request payload:", JSON.stringify(vehicleData)); // Log payload
  
    // Send request
    $.ajax({
      url: requestUrl,
      method: requestMethod,
      contentType: "application/json",
      data: JSON.stringify(vehicleData),
      success: function (response) {
        console.log("Response:", response); // Log response
        alert(
          isUpdate
            ? "Vehicle updated successfully!"
            : "Vehicle added successfully!"
        );
        $("#addVehicleModal").modal("hide");
        loadVehicleData(); // Reload the table
      },
      error: function (xhr, status, error) {
        console.error("Error saving/updating vehicle:", error);
        alert("Failed to save/update vehicle.");
      }
    });
  });
  
  

  // Reset modal when closed
  function resetModal() {
    $("#vehicleCode").val("");
    $("#licensePlateNumber").val("");
    $("#vehicleCategory").val("");
    $("#fuelType").val("Diesel");
    $("#status").val("AVAILABLE");
    $("#remarks").val("");
    $("#staffMemberId").val("");
    $("#addVehicleModalLabel").text("Add New Vehicle");
    $("#updateVehicle").text("Save Vehicle").attr("id", "saveVehicle");
  }

  // Reset modal on close
  $("#addVehicleModal").on("hidden.bs.modal", resetModal);

  // Initialize table data
  loadVehicleData();
});
