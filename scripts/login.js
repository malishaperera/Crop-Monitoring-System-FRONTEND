document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    console.log("hiiiii");
    // Get email and password values from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = { email, password };

    console.log("Submitting login data:", loginData);

    // Send a POST request to the backend API for authentication
    fetch("http://localhost:5055/cropmonitoringcollector/api/v1/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response JSON data:", data);
        if (data.token) {
          // Store the token in localStorage
          localStorage.setItem("authToken", data.token);
          console.log("Token stored:", data.token);
          // Redirect to the dashboard
          window.location.href = "crop_monitoring_dashboard.html";
        } else {
          throw new Error("Token not found in response");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert(error.message || "An error occurred during login.");
      });
  });
