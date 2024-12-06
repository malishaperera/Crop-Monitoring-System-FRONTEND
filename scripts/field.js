$(document).ready(function () {
 
  let isEdit = false,
    editId;

  // Function to show the stored data in the table
  function showInfo() {
    $("#data").empty();
    $("#loadingSpinner").show();
    const token = getAuthToken();

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      window.location.href = "pages/login_page.html";
      return;
    }


    $.ajax({
      url: "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields",
      type: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Add the token in the Authorization header
      },
      dataType: "json",
      success: function (response) {
        $("#loadingSpinner").hide();
        response.forEach(function (field) {
          $("#data").append(
            `<tr class="fieldDetails">
              <td><img src="data:image/jpeg;base64,${
                field.fieldImage1
              }" width="50" height="50"></td>
              <td><img src="data:image/jpeg;base64,${
                field.fieldImage2
              }" width="50" height="50"></td>
              <td>${field.fieldName}</td>
              <td>${field.fieldLocation.x},${field.fieldLocation.y}</td>
              <td>${field.fieldSize}</td>
              <td>${field.fieldCode || "N/A"}</td>
              <td>
                <button class="btn btn-success view-btn" data-id="${
                  field.fieldCode
                }"><i class="bi bi-eye"></i></button>
                <button class="btn btn-primary edit-btn" data-id="${
                  field.fieldCode
                }"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-danger delete-btn" data-id="${
                  field.fieldCode
                }"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`
          );
        });
      },
      error: function (xhr, status, error) {
        $("#loadingSpinner").hide();
        console.error("Failed to fetch fields:", error);
        alert("Failed to load fields. Please try again.");
      },
    });
  }

  // Handle the "New Field" button click
  $(".newField").click(function () {
    isEdit = false;
    $("#myForm")[0].reset();
    $("#fieldForm").modal("show");
    $(".submit").text("Submit");
    $(".modal-title").text("Fill the Form");
    $("#fieldName, #fieldLocation, #fieldSize").prop("disabled", false);
    $("#imgPreview1").attr("src", "../image/picture.png");
    $("#imgPreview2").attr("src", "../image/picture.png");
  });

  // Handle image upload and preview
  $("#imgInput1").change(function () {
    handleImageUpload(this, "#imgPreview1");
  });

  $("#imgInput2").change(function () {
    handleImageUpload(this, "#imgPreview2");
  });

  // Function to handle image upload and preview
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

  function getAuthToken() {
    const token = localStorage.getItem("authToken"); // Make sure 'token' is the key where the JWT is stored
    return token;  // Return the token so it can be used later
  }


  // Handle form submission (add/edit)
  $(".submit").click(function (e) {
    e.preventDefault();

    // Validation for required fields
    const fieldName = $("#fieldName").val().trim();
    const fieldLocation = $("#fieldLocation").val().trim();
    const fieldSize = $("#fieldSize").val().trim();
    const imgInput1 = document.getElementById("imgInput1").files[0];
    const imgInput2 = document.getElementById("imgInput2").files[0];
    let valid = true;

    // Check if fieldName is filled
    if (!fieldName) {
      alert("Field Name is required.");
      valid = false;
    }

    // Check if fieldLocation is filled
    if (!fieldLocation) {
      alert("Field Location is required.");
      valid = false;
    }

    // Check if fieldSize is filled
    if (!fieldSize) {
      alert("Field Size is required.");
      valid = false;
    }

    // Check if at least one image is uploaded or available
    if (!imgInput1 && !imgInput2) {
      alert("At least one image is required.");
      valid = false;
    }

    if (!valid) return;

    // Proceed with form submission if all validations pass
    let formData = new FormData();
    formData.append("fieldName", fieldName);
    formData.append("fieldLocation", fieldLocation);
    formData.append("fieldSize", fieldSize);

    // Handle first image
    if (imgInput1) {
      // If a new image is uploaded
      formData.append("fieldImage1", imgInput1);
    } else {
      // Otherwise, send the existing image if no new one is uploaded
      let img1Data = $("#imgPreview1").attr("src");
      if (img1Data !== "../image/picture.png" && img1Data.startsWith("data:image/jpeg;base64,")) {
        // Use base64 data for the image
        formData.append("fieldImage1", img1Data.split(",")[1]);
      }
    }

    // Handle second image
    if (imgInput2) {
      // If a new image is uploaded
      formData.append("fieldImage2", imgInput2);
    } else {
      // Otherwise, send the existing image if no new one is uploaded
      let img2Data = $("#imgPreview2").attr("src");
      if (img2Data !== "../image/picture.png" && img2Data.startsWith("data:image/jpeg;base64,")) {
        // Use base64 data for the image
        formData.append("fieldImage2", img2Data.split(",")[1]);
      }
    }

    // Log form data (for debugging purposes)
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Determine whether to update or create new entry
    const requestType = isEdit ? "PATCH" : "POST";
    const url = isEdit
      ? `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${editId}`
      : "http://localhost:5055/cropmonitoringcollector/api/v1/fields";

    // Get the token from localStorage
    const token = getAuthToken();

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    $.ajax({
      url: url,
      type: requestType,
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      beforeSend: function () {
        $("#loadingSpinner").show();
      },
      success: function (response, textStatus, xhr) {
        $("#loadingSpinner").hide();
        if (xhr.status === (isEdit ? 200 : 201)) {
          alert(isEdit ? "Field updated successfully!" : "Field saved successfully!");
          $("#fieldForm").modal("hide");
          $("#myForm")[0].reset();
          showInfo();
        } else {
          alert("Unexpected response. Please try again.");
        }
      },
      error: function (xhr, status, error) {
        $("#loadingSpinner").hide();
        console.error("Error:", error);
        alert("Failed to save the field. Please try again.");
      },
    });
  });

  // View field details
  $(document).on("click", ".view-btn", function () {
    const fieldId = $(this).data("id");

    const token = getAuthToken(); 

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    // Fetch field details via AJAX
    $.ajax({
      url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${fieldId}`,
      type: "GET",
      dataType: "json",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      success: function (response) {
        // Populate the modal with field details
        $("#viewFieldName").val(response.fieldName);
        $("#viewFieldLocation").val(`${response.fieldLocation.x}, ${response.fieldLocation.y}`);
        $("#viewFieldSize").val(response.fieldSize);
        $("#viewImg1").attr("src", `data:image/jpeg;base64,${response.fieldImage1}`);
        $("#viewImg2").attr("src", `data:image/jpeg;base64,${response.fieldImage2}`);

        // Populate related entities
        populateList("#viewCropCodes", response.cropCodes);
        populateList("#viewEquipmentIds", response.equipmentIds);
        populateList("#viewStaffMemberIds", response.staffMemberIds);
        populateList("#viewLogCodes", response.logCodes);

        // Show the view modal
        $("#viewFieldModal").modal("show");
      },
      error: function (xhr, status, error) {
        alert("Failed to load field details.");
        console.error("Error fetching field:", error);
      },
    });
  });

  // Helper function to populate lists in the modal
  function populateList(selector, items) {
    const listElement = $(selector);
    listElement.empty();
    if (items && items.length > 0) {
      items.forEach(item => {
        listElement.append(`<li>${item}</li>`);
      });
    } else {
      listElement.append("<li>No data available</li>");
    }
  }

  // Handle edit button click
  $(document).on("click", ".edit-btn", function () {
    isEdit = true;
    editId = $(this).data("id");

    const token = getAuthToken(); 

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    // Fetch field data for editing
    $.ajax({
      url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${editId}`,
      type: "GET",
      dataType: "json",
      headers: {
        "Authorization": `Bearer ${token}`, // Include token in the header
      },
      success: function (response) {
        // Pre-fill form for editing
        $("#fieldName").val(response.fieldName);
        $("#fieldLocation").val(`${response.fieldLocation.x}, ${response.fieldLocation.y}`);
        $("#fieldSize").val(response.fieldSize);
        $("#imgPreview1").attr("src", `data:image/jpeg;base64,${response.fieldImage1}`);
        $("#imgPreview2").attr("src", `data:image/jpeg;base64,${response.fieldImage2}`);
        $(".submit").text("Update");
        $(".modal-title").text("Edit Field");
        $("#fieldForm").modal("show");
      },
      error: function (xhr, status, error) {
        alert("Failed to fetch field data for editing.");
        console.error("Error fetching field data:", error);
      },
    });
  });

  // Handle delete button click
  $(document).on("click", ".delete-btn", function () {
    const fieldId = $(this).data("id");
    const token = getAuthToken();

    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      window.location.href = "login.html";
      return;
    }
    if (confirm("Are you sure you want to delete this field?")) {
      

      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${fieldId}`,
        type: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        success: function () {
          alert("Field deleted successfully!");
          showInfo();
        },
        error: function () {
          alert("Failed to delete the field. Please try again.");
        },
      });
    }
  });

  showInfo();
});