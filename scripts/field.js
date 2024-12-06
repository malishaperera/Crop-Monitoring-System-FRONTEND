$(document).ready(function () {
  let isEdit = false,
    editId;

  const API_BASE_URL = "http://localhost:5055/cropmonitoringcollector/api/v1/fields";
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("User not authenticated. Redirecting to login page...");
    window.location.href = "/login.html";
    return;
  }

  // Helper function for AJAX requests
  function makeRequest(url, method, data, successCallback, errorCallback) {
    $.ajax({
      url: url,
      type: method,
      data: data,
      processData: false,
      contentType: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        $("#loadingSpinner").show();
      },
      success: function (response) {
        $("#loadingSpinner").hide();
        successCallback(response);
      },
      error: function (xhr, status, error) {
        $("#loadingSpinner").hide();
        console.error("Error:", error);
        errorCallback(xhr, status, error);
      },
    });
  }

  // Function to display all fields in the table
  function showInfo() {
    $("#data").empty();
    $("#loadingSpinner").show();

    makeRequest(
      `${API_BASE_URL}/allFields`,
      "GET",
      null,
      function (response) {
        response.forEach(function (field) {
          $("#data").append(
            `<tr class="fieldDetails">
              <td><img src="data:image/jpeg;base64,${field.fieldImage1}" width="50" height="50"></td>
              <td><img src="data:image/jpeg;base64,${field.fieldImage2}" width="50" height="50"></td>
              <td>${field.fieldName}</td>
              <td>${field.fieldLocation.x},${field.fieldLocation.y}</td>
              <td>${field.fieldSize}</td>
              <td>${field.fieldCode || "N/A"}</td>
              <td>
                <button class="btn btn-success view-btn" data-id="${field.fieldCode}"><i class="bi bi-eye"></i></button>
                <button class="btn btn-primary edit-btn" data-id="${field.fieldCode}"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-danger delete-btn" data-id="${field.fieldCode}"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`
          );
        });
      },
      function () {
        alert("Failed to load fields. Please try again.");
      }
    );
  }

  // Handle "New Field" button click
  $(".newField").click(function () {
    isEdit = false;
    $("#myForm")[0].reset();
    $("#fieldForm").modal("show");
    $(".submit").text("Submit");
    $(".modal-title").text("Add New Field");
    $("#imgPreview1, #imgPreview2").attr("src", "../image/picture.png");
  });
  // Enable FieldLocation and FieldSize for adding
  $("#fieldLocation").prop("disabled", false);
  $("#fieldSize").prop("disabled", false);

  // Handle image uploads
  $("#imgInput1").change(function () {
    handleImageUpload(this, "#imgPreview1");
  });
  $("#imgInput2").change(function () {
    handleImageUpload(this, "#imgPreview2");
  });

  function handleImageUpload(input, previewSelector) {
    const file = input.files[0];
    if (file && file.size < 1000000) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $(previewSelector).attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("The file is too large. Please upload an image smaller than 1MB.");
    }
  }

  // Handle form submission (add/edit)
  $(".submit").click(function (e) {
    e.preventDefault();

    const fieldName = $("#fieldName").val().trim();
    const fieldLocation = $("#fieldLocation").val().trim();
    const fieldSize = $("#fieldSize").val().trim();
    const imgInput1 = document.getElementById("imgInput1").files[0];
    const imgInput2 = document.getElementById("imgInput2").files[0];
    let valid = true;

    // Validate inputs
    if (!fieldName || !fieldLocation || !fieldSize) {
      alert("Please fill out all required fields.");
      valid = false;
    }
    if (!imgInput1 && !imgInput2 && !isEdit) {
      alert("At least one image is required.");
      valid = false;
    }
    if (!valid) return;

    // Prepare form data
    const formData = new FormData();
    formData.append("fieldName", fieldName);
    formData.append("fieldLocation", fieldLocation);
    formData.append("fieldSize", fieldSize);

    if (imgInput1) formData.append("fieldImage1", imgInput1);
    if (imgInput2) formData.append("fieldImage2", imgInput2);

    const url = isEdit ? `${API_BASE_URL}/${editId}` : API_BASE_URL;
    const method = isEdit ? "PATCH" : "POST";

    makeRequest(
      url,
      method,
      formData,
      function () {
        alert(isEdit ? "Field updated successfully!" : "Field added successfully!");
        $("#fieldForm").modal("hide");
        $("#myForm")[0].reset();
        showInfo();
      },
      function () {
        alert("Failed to save the field. Please try again.");
      }
    );
  });

  // View field details
  $(document).on("click", ".view-btn", function () {
    const fieldId = $(this).data("id");

    makeRequest(
      `${API_BASE_URL}/${fieldId}`,
      "GET",
      null,
      function (response) {
        $("#viewFieldName").val(response.fieldName);
        $("#viewFieldLocation").val(`${response.fieldLocation.x}, ${response.fieldLocation.y}`);
        $("#viewFieldSize").val(response.fieldSize);
        $("#viewImg1").attr("src", `data:image/jpeg;base64,${response.fieldImage1}`);
        $("#viewImg2").attr("src", `data:image/jpeg;base64,${response.fieldImage2}`);

        populateList("#viewCropCodes", response.cropCodes);
        populateList("#viewEquipmentIds", response.equipmentIds);
        populateList("#viewStaffMemberIds", response.staffMemberIds);
        populateList("#viewLogCodes", response.logCodes);

        $("#viewFieldModal").modal("show");
      },
      function () {
        alert("Failed to load field details.");
      }
    );
  });

  function populateList(selector, items) {
    const list = $(selector);
    list.empty();
    if (items && items.length > 0) {
      items.forEach(item => list.append(`<li>${item}</li>`));
    } else {
      list.append("<li>No data available</li>");
    }
  }

  // Edit field
  $(document).on("click", ".edit-btn", function () {
    isEdit = true;
    editId = $(this).data("id");

    makeRequest(
      `${API_BASE_URL}/${editId}`,
      "GET",
      null,
      function (response) {
       // Populate the form fields with existing data
      $("#fieldName").val(response.fieldName);
      $("#fieldLocation").val(`${response.fieldLocation.x}, ${response.fieldLocation.y}`); // Editable
      $("#fieldSize").val(response.fieldSize); // Editable
      $("#imgPreview1").attr("src", `data:image/jpeg;base64,${response.fieldImage1}`);
      $("#imgPreview2").attr("src", `data:image/jpeg;base64,${response.fieldImage2}`);

        $(".submit").text("Update");
        $(".modal-title").text("Edit Field");
        $("#fieldForm").modal("show");
      },
      function () {
        alert("Failed to load field details for editing.");
      }
    );
  });

  // Delete field
  $(document).on("click", ".delete-btn", function () {
    const fieldId = $(this).data("id");
    if (confirm("Are you sure you want to delete this field?")) {
      makeRequest(
        `${API_BASE_URL}/${fieldId}`,
        "DELETE",
        null,
        function () {
          alert("Field deleted successfully!");
          showInfo();
        },
        function () {
          alert("Failed to delete the field. Please try again.");
        }
      );
    }
  });

  // Load data initially
  showInfo();
});
