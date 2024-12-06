$(document).ready(function () {
  // Retrieve the token from localStorage
  const token = localStorage.getItem("authToken");

  if (!token) {
    window.location.href = "login.html";
  }

  // Load Field Codes dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
    },
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (field) {
          const fieldName = field.name || field.fieldName || "Unknown";
          $("#fieldCodesSelect").append(
            `<option value="${field.fieldCode}">${field.fieldCode} - ${fieldName}</option>`
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (crop) {
          const cropName = crop.cropCommonName || "Unknown";
          $("#cropCodesSelect").append(
            `<option value="${crop.cropCode}">${crop.cropCode} - ${cropName}</option>`
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      if (data && Array.isArray(data)) {
        data.forEach(function (staff) {
          const staffName = staff.firstName || "Unknown";
          $("#staffMemberIdSelect").append(
            `<option value="${staff.staffMemberId}">${staff.staffMemberId} - ${staffName}</option>`
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      console.log(data); // Check if data is returned properly
      if (data && Array.isArray(data)) {
        data.forEach(function (log) {
          const fieldCodes = log.fieldCodes.join(", ") || "No Field Codes";
          const cropCodes = log.cropCodes.join(", ") || "No Crop Codes";
          const staffMemberIds =
            log.staffMemberIds.join(", ") || "No Staff Members";

          const imagePreview = log.observedImage
            ? `<img src="data:image/jpeg;base64,${log.observedImage}" alt="Image" width="100" />`
            : "No Image";

          $("#monitoringLogsTable tbody").append(
            `<tr data-log-code="${log.logCode}">
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
            </tr>`
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

  // --------------------------------------------start----------------------------------------------------
  // Edit Monitoring Log
  $(document).on("click", ".edit-btn", function () {
    const row = $(this).closest("tr");
    const logCode = row.data("log-code");

    const observedImage = row.find("td:eq(3)").find("img").attr("src");

    if (observedImage) {
      $("#imagePreview").attr("src", observedImage).show(); // Show image in modal
    } else {
      $("#imagePreview").hide(); // Hide image preview if no image
    }

    const logObservation = row.find("td:eq(2)").text();
    const fieldCodes = row.find("td:eq(4)").text().split(", ");
    const cropCodes = row.find("td:eq(5)").text().split(", ");
    const staffMemberIds = row.find("td:eq(6)").text().split(", ");

    $("#logObservation").val(logObservation);
    populateTable("#fieldCodesTable", fieldCodes);
    populateTable("#cropCodesTable", cropCodes);
    populateTable("#staffMemberIdTable", staffMemberIds);

    $("#logModal").modal("show");

    $("#saveLogBtn")
      .off("click")
      .on("click", function () {
        updateLog(logCode, observedImage); // Pass the current image URL to the update function
      });
  });

  function populateTable(tableId, data) {
    $(tableId + " tbody").empty();
    data.forEach(function (item) {
      $(tableId + " tbody").append(
        `<tr><td>${item}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>`
      );
    });
  }

  function updateLog(logCode, observedImage) {
    const logObservation = $("#logObservation").val();
    const fieldCodes = collectTableData("#fieldCodesTable");
    const cropCodes = collectTableData("#cropCodesTable");
    const staffMemberIds = collectTableData("#staffMemberIdTable");

    const logData = new FormData();
    logData.append("logObservation", logObservation);
    fieldCodes.forEach((code) => logData.append("fieldCodes", code));
    cropCodes.forEach((code) => logData.append("cropCodes", code));
    staffMemberIds.forEach((id) => logData.append("staffMemberIds", id));

    const newImage = $("#observedImage")[0].files[0];
    if (newImage) {
      logData.append("observedImage", newImage); // Append new image
    } else {
      if (observedImage && observedImage !== "") {
        logData.append("observedImage", observedImage); // Send the existing image URL (base64 or URL)
      } else {
        logData.append("observedImage", ""); // Send an empty string if no image exists
      }
    }

    fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs/${logCode}`,
      {
        method: "PATCH",
        body: logData,
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          alert("Log updated successfully!");
          $("#logModal").modal("hide");
          location.reload();
        } else {
          alert("Failed to update the log. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error updating log:", error);
        alert("Error occurred while updating the log.");
      });
  }

  function collectTableData(tableId) {
    const data = [];
    $(tableId + " tbody tr").each(function () {
      data.push($(this).find("td").eq(0).text());
    });
    return data;
  }

  // --------------------------------------------end----------------------------------------------------

  // Delete Monitoring Log
  $(document).on("click", ".delete-btn", function () {
    const logCode = $(this).closest("tr").data("log-code");

    const confirmation = confirm("Are you sure you want to delete this log?");

    if (confirmation) {
      $(this).closest("tr").remove();

      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/monitoringlogs/${logCode}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        },
        success: function () {
          console.log(`Log ${logCode} deleted successfully.`);
        },
        error: function (error) {
          console.error("Error deleting monitoring log:", error);
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
        `<tr><td>${fieldText}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>`
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
        `<tr><td>${cropText}</td><td><button class="btn btn-danger btn-sm deleteCropCode">Delete</button></td></tr>`
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
        `<tr><td>${staffText}</td><td><button class="btn btn-danger btn-sm deleteStaffMemberId">Delete</button></td></tr>`
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
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        },
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
  // View Monitoring Log
  $(document).on("click", ".view-btn", function () {
    const row = $(this).closest("tr");
    const logCode = row.data("log-code");

    // Retrieve data from the table row
    const logDate = row.find("td:eq(1)").text();
    const logObservation = row.find("td:eq(2)").text();
    const fieldCodes = row.find("td:eq(4)").text().split(", ");
    const cropCodes = row.find("td:eq(5)").text().split(", ");
    const staffMemberIds = row.find("td:eq(6)").text().split(", ");
    const observedImage = row.find("td:eq(3)").find("img").attr("src");

    // Populate modal with the extracted data
    $("#logCodeView").text(logCode || "No Log Code");
    $("#logDateView").text(logDate || "No Date");
    $("#logObservationView").text(logObservation || "No Observation");
    populateTable("#fieldCodesViewTable", fieldCodes);
    populateTable("#cropCodesViewTable", cropCodes);
    populateTable("#staffMemberIdViewTable", staffMemberIds);

    // If there's an image, show it in the modal
    if (observedImage) {
      $("#imagePreviewView").attr("src", observedImage).show();
    } else {
      $("#imagePreviewView").hide();
    }

    // Show the modal
    $("#logViewModal").modal("show");
  });

  // Function to populate the tables in the modal
  function populateTable(tableId, data) {
    $(tableId + " tbody").empty();
    data.forEach(function (item) {
      $(tableId + " tbody").append(`<tr><td>${item}</td></tr>`);
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
