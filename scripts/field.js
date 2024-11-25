$(document).ready(function () {
  let isEdit = false,
    editId;

  // Function to show the stored data in the table
  function showInfo() {
    $("#data").empty(); // Clear the table body
    $("#loadingSpinner").show(); // Show loading spinner

    $.ajax({
      url: "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields",
      type: "GET",
      dataType: "json",
      success: function (response) {
        $("#loadingSpinner").hide(); // Hide loading spinner
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

  // Handle form submission (add/edit)
  // Handle form submission (add/edit)
  $(".submit").click(function (e) {
    e.preventDefault();
  
    let formData = new FormData();
    formData.append("fieldName", $("#fieldName").val());
    formData.append("fieldLocation", $("#fieldLocation").val());
    formData.append("fieldSize", $("#fieldSize").val());
  
    const imgInput1 = document.getElementById("imgInput1").files[0];
    const imgInput2 = document.getElementById("imgInput2").files[0];
  
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
  
    $.ajax({
      url: url,
      type: requestType,
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#loadingSpinner").show();
      },
      success: function (response, textStatus, xhr) {
        $("#loadingSpinner").hide();
        if (xhr.status === (isEdit ? 200 : 201)) {
          alert(isEdit ? "Field updated successfully!" : "Field saved successfully!");
          $("#fieldForm").modal("hide");
          $("#myForm")[0].reset();
          showInfo(); // Refresh the table
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
    $.ajax({
      url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${fieldId}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        $("#showfieldName").val(response.fieldName);
        $("#showFieldLocation").val(
          `${response.fieldLocation.x}, ${response.fieldLocation.y}`
        );
        $("#showfieldSize").val(response.fieldSize);
        $("#showImg1").attr(
          "src",
          `data:image/jpeg;base64,${response.fieldImage1}`
        );
        $("#showImg2").attr(
          "src",
          `data:image/jpeg;base64,${response.fieldImage2}`
        );
        $("#readData").modal("show");
      },
      error: function (xhr, status, error) {
        alert("Failed to load field details.");
        console.error("Error fetching field:", error);
      },
    });
  });

  
  // Edit field details
  $(document).on("click", ".edit-btn", function () {
    const fieldId = $(this).data("id");
    $.ajax({
      url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${fieldId}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        $("#fieldName").val(response.fieldName);
        $("#fieldLocation").val(
          `${response.fieldLocation.x}, ${response.fieldLocation.y}`
        );
        $("#fieldSize").val(response.fieldSize);
        $("#imgPreview1").attr(
          "src",
          `data:image/jpeg;base64,${response.fieldImage1}`
        );
        $("#imgPreview2").attr(
          "src",
          `data:image/jpeg;base64,${response.fieldImage2}`
        );

        // Ensure fields are editable
        $("#fieldLocation").prop("disabled", false); // Enable fieldLocation
        $("#fieldSize").prop("disabled", false); // Enable fieldSize

        isEdit = true;
        editId = fieldId;
        $(".submit").text("Update");
        $(".modal-title").text("Edit the Form");
        $("#fieldForm").modal("show");
      },
      error: function (xhr, status, error) {
        alert("Failed to load field details for editing.");
        console.error("Error fetching field:", error);
      },
    });
  });

  // Delete field
  $(document).on("click", ".delete-btn", function () {
    const fieldId = $(this).data("id");
    if (confirm("Are you sure you want to delete this field?")) {
      $.ajax({
        url: `http://localhost:5055/cropmonitoringcollector/api/v1/fields/${fieldId}`,
        type: "DELETE",
        success: function (response) {
          alert("Field deleted successfully!");
          showInfo(); // Refresh the table
        },
        error: function (xhr, status, error) {
          alert("Failed to delete the field. Please try again.");
          console.error("Error:", error);
          console.error("Status:", status);
        },
      });
    }
  });

  // On page load, fetch and display all fields
  showInfo();
});
