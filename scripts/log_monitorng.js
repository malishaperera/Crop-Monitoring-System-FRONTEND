$(document).ready(function () {
  // Generate Log Code on modal show
  $("#logModal").on("show.bs.modal", function () {
    const logCode = "LOG-" + Date.now(); // Simple log code based on timestamp
    $("#logCode").val(logCode);
  });

  // Add Field Code to table
  $("#fieldCodesSelect").change(function () {
    const fieldCode = $(this).val();
    if (fieldCode) {
      $("#fieldCodesTable tbody").append(
        `<tr><td>${fieldCode}</td><td><button class="btn btn-danger btn-sm deleteFieldCode">Delete</button></td></tr>`
      );
      $(this).val("");
    }
  });

  // Add Crop Code to table
  $("#cropCodesSelect").change(function () {
    const cropCode = $(this).val();
    if (cropCode) {
      $("#cropCodesTable tbody").append(
        `<tr><td>${cropCode}</td><td><button class="btn btn-danger btn-sm deleteCropCode">Delete</button></td></tr>`
      );
      $(this).val("");
    }
  });

  // Add Equipment Code to table
  $("#equipmentCodesSelect").change(function () {
    const equipmentCode = $(this).val();
    if (equipmentCode) {
      $("#equipmentCodesTable tbody").append(
        `<tr><td>${equipmentCode}</td><td><button class="btn btn-danger btn-sm deleteEquipmentCode">Delete</button></td></tr>`
      );
      $(this).val("");
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
  // Save Log Button
  $("#saveLogBtn").click(function () {
    const logData = {
      logCode: $("#logCode").val(),
      logDate: $("#logDate").val(),
      logObservation: $("#logObservation").val(),
      observedImage: null, // Image will be set later
      fieldCodes: [],
      cropCodes: [],
      equipmentCodes: [],
    };

    // Check if an image is selected
    const file = $("#observedImage")[0].files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        logData.observedImage = e.target.result; // Store Data URL
        appendLogDataToTable(logData); // Append log data to the table
      };
      reader.readAsDataURL(file); // Convert the image file to Data URL
    } else {
      appendLogDataToTable(logData); // If no image is selected, just add the log data without an image
    }

    // Get Field Codes
    $("#fieldCodesTable tbody tr").each(function () {
      logData.fieldCodes.push($(this).find("td").eq(0).text());
    });

    // Get Crop Codes
    $("#cropCodesTable tbody tr").each(function () {
      logData.cropCodes.push($(this).find("td").eq(0).text());
    });

    // Get Equipment Codes
    $("#equipmentCodesTable tbody tr").each(function () {
      logData.equipmentCodes.push($(this).find("td").eq(0).text());
    });

    // Append Log Data to Main Table
    function appendLogDataToTable(logData) {
      $("#logsTable tbody").append(
        `<tr>
  <td>${logData.logCode}</td>
  <td>${logData.logDate}</td>
  <td>${logData.logObservation}</td>
  <td>${
    logData.observedImage
      ? `<img src="${logData.observedImage}" alt="Image" style="max-width: 100px; max-height: 100px;">`
      : "No Image"
  }</td>
  <td>${logData.fieldCodes.join(", ")}</td>
  <td>${logData.cropCodes.join(", ")}</td>
  <td>${logData.equipmentCodes.join(", ")}</td>
  <td>
  <button class="btn btn-success view-btn"><i class="bi bi-eye"></i></button>
  <button class="btn btn-primary edit-btn"><i class="bi bi-pencil-square"></i></button>
  <button class="btn btn-danger delete-btn"><i class="bi bi-trash"></i></button>
  
  
  </td>
</tr>`
      );

      // Clear the tables (Field, Crop, Equipment)
      $("#fieldCodesTable tbody").empty();
      $("#cropCodesTable tbody").empty();
      $("#equipmentCodesTable tbody").empty();

      // Reset the form
      $("#logForm")[0].reset();
      $("#imagePreview").hide();
      $("#logModal").modal("hide");
    }
  });
});