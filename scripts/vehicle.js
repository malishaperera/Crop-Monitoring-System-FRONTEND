$(document).ready(function () {
  let vehicleCode;
  const vehicleApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/allVehicles";
  const staffApiUrl =
    "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs";

  // Get JWT Token from localStorage
  function getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Fetch and populate staff data in the "Staff Member ID" dropdown
  $.ajax({
    url: staffApiUrl,
    method: "GET",
    dataType: "json",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    success: function (staffData) {
      const staffDropdown = $("#staffMemberId");
      staffDropdown.empty();
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
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      success: function (vehicleData) {
        const tableBody = $("#vehicleTable tbody");
        tableBody.empty();
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
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
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

      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/vehicles/${vehicleCode}`,
        method: "GET",
        dataType: "json",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        success: function (vehicleDetails) {
          if (vehicleDetails) {
            // Populate modal fields
            $("#vehicleCode").val(vehicleDetails.vehicleCode); 
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
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          success: function () {
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

  // Save or update vehicle
  $(document).on("click", "#saveVehicle, #updateVehicle", function () {
    const isUpdate = $(this).attr("id") === "updateVehicle";
    const vehicleCode = $("#vehicleCode").val();

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

    // Send request
    $.ajax({
      url: requestUrl,
      method: requestMethod,
      contentType: "application/json",
      data: JSON.stringify(vehicleData),
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      success: function () {
        alert(
          isUpdate
            ? "Vehicle updated successfully!"
            : "Vehicle added successfully!"
        );
        $("#addVehicleModal").modal("hide");
        loadVehicleData();
      },
      error: function (xhr, status, error) {
        console.error("Error saving/updating vehicle:", error);
        alert("Failed to save/update vehicle.");
      },
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
