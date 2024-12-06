// Number counting animation for the cards
 function animateCount(id, target) {
  let current = 0;
  const increment = Math.ceil(target / 100);
  const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
          current = target;
          clearInterval(interval);
      }
      document.getElementById(id).textContent = current;
  }, 20);
}
// Check if the token exists in localStorage
const authToken = localStorage.getItem("authToken");

if (!authToken) {
  console.log("No auth token found in localStorage");
} else {
  console.log("Auth Token from localStorage:", authToken);
}

// Start animations for counts
animateCount('staffCount', 50); 
animateCount('cropCount', 120); 
animateCount('vehicleCount', 35); 