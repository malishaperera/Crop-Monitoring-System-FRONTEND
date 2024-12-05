// Fetch staff IDs from the backend API
fetch("http://localhost:5055/cropmonitoringcollector/api/v1/staffs/allStaffs")
  .then((response) => response.json())
  .then((staffs) => {
    const staffIdSelect = document.getElementById("staffId");

    // Populate the staffId dropdown with staff data from the backend
    staffs.forEach((staff) => {
      const option = document.createElement("option");
      option.value = staff.staffMemberId;  // Assuming staff has a staffMemberId property
      option.textContent = `Staff ID: ${staff.staffMemberId} - ${staff.firstName}`;  // Display staff ID and name
      staffIdSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error fetching staff:", error);
    alert("Failed to load staff data. Please try again.");
  });

// Handle form submission
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Get selected staff member ID
  const staffMemberId = document.getElementById("staffId").value;

  // Check if the passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please check and try again.");
    console.log("Password mismatch: Passwords don't match.");
    return;  // Prevent form submission if passwords don't match
  }

  // Prepare the FormData object
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("staffMemberId", staffMemberId);  // Add the staff member ID to the form data

  console.log("Form data:", formData);  // Log the form data for debugging

  // Send data to your backend API for signup
  fetch("http://localhost:5055/cropmonitoringcollector/api/v1/auth/signup", {
    method: "POST",
    body: formData, // Send FormData object directly
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.token) {
        console.log("Signup successful:", result);
        alert("Signup successful! Redirecting to dashboard...");
        // Store the JWT token (optional: in localStorage or sessionStorage)
        localStorage.setItem("authToken", result.token);
        // Optionally, redirect the user to another page
        window.location.href = "/dashboard";  // Example: Redirect to a dashboard
      } else {
        alert("Signup failed. Please try again.");
        console.log("Signup failed: No token returned.");
      }
    })
    .catch((error) => {
      console.error("Signup error:", error);
      alert("Signup error. Please try again.");
    });
});
