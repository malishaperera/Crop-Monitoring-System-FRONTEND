// Number counting animation for the cards
 function animateCount(id, target) {
  let current = 0;
  const increment = Math.ceil(target / 100); // Incremental step
  const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
          current = target; // Stop at the target number
          clearInterval(interval);
      }
      document.getElementById(id).textContent = current;
  }, 20); // Speed of the animation
}
// Check if the token exists in localStorage
const authToken = localStorage.getItem("authToken");

if (!authToken) {
  // If there's no token, log a message
  console.log("No auth token found in localStorage");
} else {
  // If the token exists, print it in the console
  console.log("Auth Token from localStorage:", authToken);
}

// Start animations for counts
animateCount('staffCount', 50); 
animateCount('cropCount', 120); 
animateCount('vehicleCount', 35); 