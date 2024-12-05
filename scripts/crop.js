// Function to get the token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Load Field Codes dynamically for the dropdown
async function loadFieldCodes() {
  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/crops/allCrops",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials (cookies or other credentials)
        mode: "cors",
      }
    );

    console.log("Response status:", response.status);
    console.log("Response body:", await response.text());

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
  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5055/cropmonitoringcollector/api/v1/crops/allCrops",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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
  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
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

// Add crop (for both Add and Edit actions)
async function addOrEditCrop(event) {
  event.preventDefault();

  const token = getAuthToken();
  if (!token) {
    alert("Authentication token is missing.");
    return;
  }

  const cropCode = document
    .getElementById("editCropForm")
    .getAttribute("data-crop-code");

  const formData = new FormData(document.getElementById("editCropForm"));

  try {
    const response = await fetch(
      cropCode
        ? `http://localhost:5055/cropmonitoringcollector/api/v1/crops/${cropCode}`
        : "http://localhost:5055/cropmonitoringcollector/api/v1/crops/addCrop",
      {
        method: cropCode ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to add or edit crop");

    alert(cropCode ? "Crop updated successfully!" : "Crop added successfully!");
    loadAllCrops(); // Reload crops after adding or editing
  } catch (error) {
    console.error("Error adding or editing crop:", error);
    alert("An error occurred while adding or editing the crop. Please try again.");
  }
}

// Initialize the page by loading field codes and crops
loadFieldCodes();
loadAllCrops();
