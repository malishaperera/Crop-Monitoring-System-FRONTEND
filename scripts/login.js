document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get email and password values from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = {
      email: email,
      password: password,
    };

    // Send a POST request to the backend API for authentication
    fetch("http://localhost:5055/cropmonitoringcollector/api/v1/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => {
        // If the response is successful (status 200), handle it
        if (response.ok) {
          return response.json(); // Parse JSON response
        } else {
          throw new Error("Invalid email or password");
        }
      })
      .then((data) => {
        if (data.token) {
          // Successfully logged in, store the JWT token
          localStorage.setItem("authToken", data.token);

          // Redirect to the crop_monitoring_dashboard.html page
          window.location.href = "crop_monitoring_dashboard.html"; 
        } else {
          alert("Invalid email or password");
        }
      })
      .catch((error) => {
        // If there is any error during the fetch request
        console.error("Error:", error);
        alert(error.message || "An error occurred while logging in");
      });
  });
