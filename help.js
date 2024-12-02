$(document).ready(function () {
  // Load Field Codes dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (field) {
          const fieldName = field.name || field.fieldName || "Unknown";
          $("#fieldCodesSelect").append(
            <option value="${field.fieldCode}">${field.fieldCode} - ${fieldName}</option>
          );
        });
      } else {
        console.error("Invalid data format received from the backend.");
      }
    },
    error: function (error) {
      console.error("Error loading field data:", error);
    },
  });

  // Load Crop Codes dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/crops/allCrops",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (crop) {
          const cropName = crop.cropCommonName || "Unknown";
          $("#cropCodesSelect").append(
            <option value="${crop.cropCode}">${crop.cropCode} - ${cropName}</option>
          );
        });
      } else {
        console.error("Invalid data format received from the backend.");
      }
    },
    error: function (error) {
      console.error("Error loading crop data:", error);
    },
  });

  // Load Staff Member IDs dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (staff) {
          const staffName = staff.firstName || "Unknown";
          $("#staffMemberIdSelect").append(
            <option value="${staff.staffMemberId}">${staff.staffMemberId} - ${staffName}</option>
          );
        });
      } else {
        console.error("Invalid data format received from the backend.");
      }
    },
    error: function (error) {
      console.error("Error loading staff data:", error);
    },
  });

  // Load Monitoring Logs dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs/allMonitoringLogs",
    method: "GET",
    success: function (data) {
      console.log(data); // Check if data is returned properly
      if (data && Array.isArray(data)) {
        data.forEach(function (log) {
          const fieldCodes = log.fieldCodes.join(", ") || "No Field Codes";
          const cropCodes = log.cropCodes.join(", ") || "No Crop Codes";
          const staffMemberIds =
            log.staffMemberIds.join(", ") || "No Staff Members";

          // Ensure the image URL or base64 data is correctly formatted
          const imagePreview = log.observedImage
            ? <img src="data:image/jpeg;base64,${log.observedImage}" alt="Image" width="100" />
            : "No Image";

          // Append data to the monitoring logs table
          $("#monitoringLogsTable tbody").append(
            <tr data-log-code="${log.logCode}">
              <td>${log.logCode || "No Log Code"}</td>
              <td>${log.logDate || "No Date"}</td>
              <td>${log.logObservation || "No Observation"}</td>
              <td>${imagePreview}</td>
              <td>${fieldCodes}</td>
              <td>${cropCodes}</td>
              <td>${staffMemberIds}</td>
              <td>
                <button class="btn btn-success view-btn"><i class="bi bi-eye"></i></button>
                <button class="btn btn-primary edit-btn"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-danger delete-btn"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          );
        });
      } else {
        console.error("Invalid data format received from the backend.");
      }
    },
    error: function (error) {
      console.error("Error loading monitoring logs:", error);
    },
  });

  $(document).ready(function () {
    // Handle Edit Button Click
    $(document).on("click", ".edit-btn", function () {
      const row = $(this).closest("tr");
      const logCode = row.data("log-code");

      // Fetch the details from the selected row
      const logDate = row.find("td:eq(1)").text();
      const logObservation = row.find("td:eq(2)").text();
      const fieldCodes = row.find("td:eq(4)").text().split(", ");
      const cropCodes = row.find("td:eq(5)").text().split(", ");
      const staffMemberIds = row.find("td:eq(6)").text().split(", ");

      // Populate the modal form fields
      $("#logModalLabel").text("Edit Log"); // Change modal title
      $("#logObservation").val(logObservation);

      // Populate Field Codes table
      $("#fieldCodesTable tbody").empty();
      fieldCodes.forEach((code) => {
        $("#fieldCodesTable tbody").append(
          <tr><td>${code}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>
        );
      });

      // Populate Crop Codes table
      $("#cropCodesTable tbody").empty();
      cropCodes.forEach((code) => {
        $("#cropCodesTable tbody").append(
          <tr><td>${code}</td><td><button class="btn btn-danger btn-sm deleteCropCode">Delete</button></td></tr>
        );
      });

      // Populate Staff Member IDs table
      $("#staffMemberIdTable tbody").empty();
      staffMemberIds.forEach((id) => {
        $("#staffMemberIdTable tbody").append(
          <tr><td>${id}</td><td><button class="btn btn-danger btn-sm deleteStaffMemberId">Delete</button></td></tr>
        );
      });

      // Show the modal
      $("#logModal").modal("show");

      // Bind Save Changes button for Update
      $("#saveLogBtn")
        .off("click")
        .on("click", function () {
          updateLog(logCode);
        });
    });

    // Function to send updated log to the backend
    function updateLog(logCode) {
      const logObservation = $("#logObservation").val();

      // Collect Field Codes
      const fieldCodes = [];
      $("#fieldCodesTable tbody tr").each(function () {
        const fieldCode = $(this).find("td").eq(0).text();
        fieldCodes.push(fieldCode);
      });

      // Collect Crop Codes
      const cropCodes = [];
      $("#cropCodesTable tbody tr").each(function () {
        const cropCode = $(this).find("td").eq(0).text();
        cropCodes.push(cropCode);
      });

      // Collect Staff Member IDs
      const staffMemberIds = [];
      $("#staffMemberIdTable tbody tr").each(function () {
        const staffId = $(this).find("td").eq(0).text();
        staffMemberIds.push(staffId);
      });

      // Prepare FormData for the PATCH request
      const logData = new FormData();
      logData.append("logObservation", logObservation);
      fieldCodes.forEach((code) => logData.append("fieldCodes", code));
      cropCodes.forEach((code) => logData.append("cropCodes", code));
      staffMemberIds.forEach((id) => logData.append("staffMemberIds", id));

      // Check if an image is selected
      const file = $("#observedImage")[0].files[0];
      if (file) {
        logData.append("observedImage", file);
      }

      // Send the PATCH request to the backend
      fetch(
        http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs/${logCode},
        {
          method: "PATCH",
          body: logData, // Send the updated data
        }
      )
        .then((response) => {
          if (response.ok) {
            alert("Log updated successfully!");
            $("#logModal").modal("hide");
            location.reload(); // Refresh the page to reflect changes
          } else {
            alert("Failed to update the log. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error updating log:", error);
          alert("Error occurred while updating the log.");
        });
    }
  });


  // ------------------------------------------------------------------------------------------------

  // Delete Monitoring Log
  $(document).on("click", ".delete-btn", function () {
    const logCode = $(this).closest("tr").data("log-code"); // Get the logCode for the entry to delete

    // Show confirmation dialog
    const confirmation = confirm("Are you sure you want to delete this log?");

    if (confirmation) {
      // Immediately remove the row from the table
      $(this).closest("tr").remove();

      // Delete the log entry from the backend
      $.ajax({
        url: http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs/${logCode},
        method: "DELETE",
        success: function () {
          console.log(Log ${logCode} deleted successfully.);
        },
        error: function (error) {
          console.error(Failed to delete log ${logCode}:, error);
          alert("Error deleting the log. Please try again.");
        },
      });
    } else {
      console.log("Delete action canceled.");
    }
  });

  // Add selected Field Code to the table
  $("#fieldCodesSelect").change(function () {
    const fieldCode = $(this).val();
    const fieldText = $("#fieldCodesSelect option:selected").text(); // Get the text of the selected option

    if (fieldCode) {
      $("#fieldCodesTable tbody").append(
        <tr><td>${fieldText}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>
      );
      $(this).val(""); // Clear the select dropdown after adding
    }
  });

  // Add selected Crop Code to the table
  $("#cropCodesSelect").change(function () {
    const cropCode = $(this).val();
    const cropText = $("#cropCodesSelect option:selected").text(); // Get the text of the selected option
    if (cropCode) {
      $("#cropCodesTable tbody").append(
        <tr><td>${cropText}</td><td><button class="btn btn-danger btn-sm deleteCropCode">Delete</button></td></tr>
      );
      $(this).val(""); // Clear selection after adding
    }
  });

  // Add selected Staff Member ID to the table
  $("#staffMemberIdSelect").change(function () {
    const staffMemberId = $(this).val();
    const staffText = $("#staffMemberIdSelect option:selected").text(); // Get the text of the selected option
    if (staffMemberId) {
      $("#staffMemberIdTable tbody").append(
        <tr><td>${staffText}</td><td><button class="btn btn-danger btn-sm deleteStaffMemberId">Delete</button></td></tr>
      );
      $(this).val(""); // Clear selection after adding
    }
  });

  // Delete Field Code
  $(document).on("click", ".deleteFieldCode", function () {
    $(this).closest("tr").remove();
  });

  // Delete Crop Code
  $(document).on("click", ".deleteCropCode", function () {
    $(this).closest("tr").remove();
  });

  // Delete Staff Member ID
  $(document).on("click", ".deleteStaffMemberId", function () {
    $(this).closest("tr").remove();
  });

  // Image Preview
  $("#observedImage").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#imagePreview").attr("src", e.target.result).show();
      };
      reader.readAsDataURL(file);
    }
  });

  // Save Log Button
  $("#saveLogBtn").click(function () {
    const logObservation = $("#logObservation").val();

    // Collect Field Codes
    const fieldCodes = [];
    $("#fieldCodesTable tbody tr").each(function () {
      const fieldCode = $(this).find("td").eq(0).text().split(" - ")[0];
      fieldCodes.push(fieldCode);
    });

    // Collect Crop Codes
    const cropCodes = [];
    $("#cropCodesTable tbody tr").each(function () {
      const cropCode = $(this).find("td").eq(0).text().split(" - ")[0];
      cropCodes.push(cropCode);
    });

    // Collect Staff Member IDs
    const staffMemberIds = [];
    $("#staffMemberIdTable tbody tr").each(function () {
      const staffId = $(this).find("td").eq(0).text().split(" - ")[0];
      staffMemberIds.push(staffId);
    });

    // Validation: Ensure required data is present
    if (staffMemberIds.length === 0) {
      alert("Please select at least one staff member.");
      return;
    }
    if (fieldCodes.length === 0 && cropCodes.length === 0) {
      alert("Please select at least one field code or crop code.");
      return;
    }

    // Prepare FormData
    const logData = new FormData();
    logData.append("logObservation", logObservation);

    fieldCodes.forEach((code) => logData.append("fieldCodes", code));
    cropCodes.forEach((code) => logData.append("cropCodes", code));
    staffMemberIds.forEach((id) => logData.append("staffMemberIds", id));

    // Check if an image is selected
    const file = $("#observedImage")[0].files[0];
    if (file) {
      logData.append("observedImage", file);
    }

    // Send data to backend
    sendToBackend(logData);
  });

  // Function to send Log Data to the backend
  function sendToBackend(logData) {
    fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs",
      {
        method: "POST",
        body: logData, // Send the FormData
      }
    )
      .then((response) => {
        if (response.ok) {
          alert("Log saved successfully!");
          // Reset the form
          resetForm();
        } else {
          alert("Failed to save the log. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error occurred while saving the log.");
      });
  }

  // Reset form after saving the log
  function resetForm() {
    $("#logObservation").val("");
    $("#fieldCodesTable tbody").empty();
    $("#cropCodesTable tbody").empty();
    $("#staffMemberIdTable tbody").empty();
    $("#imagePreview").hide();
    $("#observedImage").val("");
  }
});
