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
  .catch((error) => console.error("Error fetching staff:", error));

// Handle form submission
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  
  // Get form values
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  // Check if the passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please check and try again.");
    return;  // Prevent form submission if passwords don't match
  }

  // Proceed with the form submission if passwords match
  const formData = new FormData(signupForm);
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
    staffId: formData.get("staffId"),  // Send the selected staff ID
  };
  console.log("Form data:", data);

  // Send data to your backend API for signup
  fetch("http://localhost:5055/cropmonitoringcollector/api/v1/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Signup successful:", result);
      // You can add a success message or redirect the user to another page
    })
    .catch((error) => {
      console.error("Signup error:", error);
      // You can display an error message here
    });
});
