$(document).ready(function () {
  // Load Field Codes dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        // Log the full response to inspect structure
        console.log(data);

        data.forEach(function (field) {
          // Log field properties to verify structure
          console.log(field.fieldCode, field.name); // Log fieldCode and name

          // Assuming 'name' exists or is a different field like 'fieldName'
          const fieldName = field.name || field.fieldName || "Unknown"; // Fallback to 'Unknown' if undefined
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

  // Add selected Field Code to the table
  $("#fieldCodesSelect").change(function () {
    const fieldCode = $(this).val();
    const fieldText = $("#fieldCodesSelect option:selected").text(); // Get the text of the selected option

    if (fieldCode) {
      // Append selected field code to the mini table
      $("#fieldCodesTable tbody").append(
        `<tr><td>${fieldText}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>`
      );
      $(this).val(""); // Clear the select dropdown after adding
    }
  });

  // Load Crop Codes dynamically from the backend
  // Load Crop Codes dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/crops/allCrops",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        console.log(data); // Log the full response for debugging

        data.forEach(function (crop) {
          console.log(crop.cropCode, crop.cropCommonName); // Inspect individual crop properties

          // Use cropCommonName for the crop name
          const cropName = crop.cropCommonName || "Unknown"; // Fallback to 'Unknown' if undefined
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

  // Add Crop Code to table
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

  // Load Staff Member IDs dynamically from the backend
  $.ajax({
    url: "http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs",
    method: "GET",
    success: function (data) {
      if (data && Array.isArray(data)) {
        console.log(data); // Log the full response for debugging

        data.forEach(function (staff) {
          console.log(staff.staffMemberId, staff.firstName); // Inspect individual staff properties

          // Use staffMemberId for the ID and staff.name for the name
          const staffName = staff.firstName || "Unknown"; // Fallback to 'Unknown' if undefined
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

  // Add Staff Code to table
  $("#staffMemberIdSelect").change(function () {
    const staffMemberId = $(this).val();
    const staffText = $("#staffMemberIdSelect option:selected").text(); // Get the text of the selected option
    if (staffMemberId) {
      $("#staffMemberIdTable tbody").append(
        `<tr><td>${staffText}</td><td><button class="btn btn-danger btn-sm deleteEquipmentCode">Delete</button></td></tr>`
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

  // Delete Equipment Code
  $(document).on("click", ".deleteEquipmentCode", function () {
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
  // Save Log Button
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
  
    fieldCodes.forEach(code => logData.append("fieldCodes", code));
    cropCodes.forEach(code => logData.append("cropCodes", code));
    staffMemberIds.forEach(id => logData.append("staffMemberIds", id));
  
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
        alert("An error occurred while saving the log.");
      });
  }

  // Reset form and clear tables
  function resetForm() {
    // Clear the observation
    $("#logObservation").val("");

    // Clear all selection tables
    $("#fieldCodesTable tbody").empty();
    $("#cropCodesTable tbody").empty();
    $("#staffMemberIdTable tbody").empty();

    // Clear the image preview
    $("#observedImage").val("");
    $("#imagePreview").hide();

    // Reset selects
    $("#fieldCodesSelect").val("");
    $("#cropCodesSelect").val("");
    $("#staffMemberIdSelect").val("");
  }
});
