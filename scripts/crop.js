// Load Field Codes dynamically for the dropdown
async function loadFieldCodes() {
  try {
    const response = await fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/fields/allFields"
    );
    if (!response.ok) throw new Error("Failed to fetch fields");

    const fields = await response.json();
    const fieldCodeSelects = document.querySelectorAll(
      "#fieldCode, #editFieldCode"
    );

    fieldCodeSelects.forEach((select) => {
      select.innerHTML =
        '<option value="" disabled selected>Select a Field Code</option>';
      fields.forEach((field) => {
        const option = document.createElement("option");
        option.value = field.fieldCode;
        option.textContent = field.fieldCode;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error("Error loading field codes:", error);
    alert("Unable to load field codes. Please try again later.");
  }
}

// Fetch all crops and populate them as cards in the grid
async function loadAllCrops() {
  try {
    const response = await fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/crops/allCrops"
    );
    if (!response.ok) throw new Error("Failed to fetch crops");

    const crops = await response.json();
    const cropGrid = document.getElementById("cropGrid");

    cropGrid.innerHTML = ""; // Clear the grid before appending

    crops.forEach((crop) => {
      const cropImageURL = `data:image/jpeg;base64,${crop.cropImage}`;

      const cropCard = `
        <div class="col-3">
          <div class="crop-card">
            <img src="${cropImageURL}" alt="Crop Image" class="img-fluid">
            <div class="crop-details">
              <h5>${crop.cropCommonName}</h5>
              <p><strong>Scientific Name:</strong> ${crop.cropScientificName}</p>
              <p><strong>Category:</strong> ${crop.category}</p>
              <p><strong>Season:</strong> ${crop.cropSeason}</p>
              <p><strong>Field Code:</strong> ${crop.fieldCode}</p>
              <p><strong>Crop Code:</strong> ${crop.cropCode}</p>
            </div>
            <div class="crop-actions">
              <button class="btn btn-success view-btn" data-id="${crop.cropCode}"><i class="bi bi-eye"></i> View</button>
              <button class="btn btn-primary edit-btn" data-id="${crop.cropCode}"><i class="bi bi-pencil-square"></i> Edit</button>
              <button class="btn btn-danger delete-btn" data-id="${crop.cropCode}"><i class="bi bi-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      `;
      cropGrid.insertAdjacentHTML("beforeend", cropCard);
    });

    // Attach event listeners for buttons
    addViewButtonListeners();
    addEditButtonListeners();
    addDeleteButtonListeners();
  } catch (error) {
    console.error("Error loading crops:", error);
    alert("Unable to load crops. Please try again later.");
  }
}

// Add event listeners for View buttons
function addViewButtonListeners() {
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const cropCode = button.getAttribute("data-id");
      await fetchCropDetails(cropCode);
    });
  });
}

// Add event listeners for Edit buttons
function addEditButtonListeners() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const cropCode = button.getAttribute("data-id");
      await populateEditForm(cropCode);
    });
  });
}

// Add event listeners for Delete buttons
function addDeleteButtonListeners() {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const cropCode = button.getAttribute("data-id");
      await deleteCrop(cropCode);
    });
  });
}

// Function to fetch crop details and populate the view modal
async function fetchCropDetails(cropCode) {
  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`
    );
    if (!response.ok) throw new Error("Failed to fetch crop details");

    const crop = await response.json();

    // Populate modal with crop details
    document.getElementById(
      "viewCropImage"
    ).src = `data:image/jpeg;base64,${crop.cropImage}`;
    document.getElementById("viewCropName").textContent = crop.cropCommonName;
    document.getElementById("viewCropScientificName").textContent =
      crop.cropScientificName;
    document.getElementById("viewCropCategory").textContent = crop.category;
    document.getElementById("viewCropSeason").textContent = crop.cropSeason;
    document.getElementById("viewCropFieldCode").textContent = crop.fieldCode;
    document.getElementById("viewCropCode").textContent = crop.cropCode;

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById("viewCropModal"));
    modal.show();
  } catch (error) {
    console.error("Error fetching crop details:", error);
    alert("Failed to load crop details. Please try again.");
  }
}

// Function to delete a crop
async function deleteCrop(cropCode) {
  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      document
        .querySelector(`[data-id="${cropCode}"]`)
        .closest(".col-3")
        .remove();
      alert("Crop deleted successfully!");
    } else {
      const errorMessage = await response.text();
      alert(`Error deleting crop: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error deleting crop:", error);
    alert("An error occurred while deleting the crop. Please try again.");
  }
}

// Function to populate the edit form
async function populateEditForm(cropCode) {
  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`
    );
    if (!response.ok) throw new Error("Failed to fetch crop details");

    const crop = await response.json();

    // Populate the edit form fields
    document.getElementById("editCropName").value = crop.cropCommonName;
    document.getElementById("editCropScientificName").value =
      crop.cropScientificName;
    document.getElementById("editCategory").value = crop.category;
    document.getElementById("editSeason").value = crop.cropSeason;
    document.getElementById("editFieldCode").value = crop.fieldCode;
    document.getElementById("editCropImage").value = ""; // Reset file input

    // Store cropCode as a data attribute for later use
    document
      .getElementById("editCropForm")
      .setAttribute("data-crop-code", cropCode);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById("editCropModal"));
    modal.show();
  } catch (error) {
    console.error("Error populating edit form:", error);
    alert("Failed to load crop details for editing. Please try again.");
  }
}

// Handle form submission for adding a new crop
document
  .getElementById("addCropForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const cropCommonName = document.getElementById("cropName").value;
    const cropScientificName =
      document.getElementById("cropScientificName").value;
    const category = document.getElementById("category").value;
    const cropSeason = document.getElementById("season").value;
    const fieldCode = document.getElementById("fieldCode").value;
    const cropImageFile = document.getElementById("cropImage").files[0];

    if (!cropImageFile) {
      alert("Please upload an image!");
      return;
    }

    const formData = new FormData();
    formData.append("cropCommonName", cropCommonName);
    formData.append("cropScientificName", cropScientificName);
    formData.append("category", category);
    formData.append("cropSeason", cropSeason);
    formData.append("fieldCode", fieldCode);
    formData.append("cropImage", cropImageFile);

    try {
      const response = await fetch(
        "http://localhost:5055/cropmonitoringcollector/api/v1/crops",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        loadAllCrops();
        alert("Crop saved successfully!");
        document.getElementById("addCropForm").reset();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addCropModal")
        );
        modal.hide();
      } else {
        const errorMessage = await response.text();
        alert(`Error adding crop: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      alert("An error occurred. Please try again later.");
    }
  });

// Handle form submission for editing a crop
// Handle form submission for editing a crop
document
  .getElementById("editCropForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const cropCode = e.target.getAttribute("data-crop-code");
    const cropCommonName = document.getElementById("editCropName").value;
    const cropScientificName = document.getElementById(
      "editCropScientificName"
    ).value;
    const category = document.getElementById("editCategory").value;
    const cropSeason = document.getElementById("editSeason").value;
    const fieldCode = document.getElementById("editFieldCode").value;
    const cropImageFile = document.getElementById("editCropImage").files[0];

    const formData = new FormData();
    formData.append("cropCommonName", cropCommonName);
    formData.append("cropScientificName", cropScientificName);
    formData.append("category", category);
    formData.append("cropSeason", cropSeason);
    formData.append("fieldCode", fieldCode);

    if (cropImageFile) {
      formData.append("cropImage", cropImageFile);
    }

    try {
      const response = await fetch(
        `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.ok) {
        loadAllCrops(); // Refresh the crops display
        alert("Crop updated successfully!");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editCropModal")
        );
        modal.hide();
      } else {
        const errorMessage = await response.text();
        alert(`Error updating crop: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      alert("An error occurred. Please try again later.");
    }
  });

// Initial load of field codes and crops
document.addEventListener("DOMContentLoaded", () => {
  loadFieldCodes();
  loadAllCrops();
});



//This Crop