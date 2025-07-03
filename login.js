
  async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch(`http://localhost:3000/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length === 0) {
        alert("Invalid email or password.");
        return;
      }

      const user = users[0];

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      if (user.role === "admin") {
        window.location.href = "admin.html";
      } else if (user.role === "batchOwner") {
        window.location.href = "batch.html";
      } else {
        alert("Unknown role.");
      }

    } catch (error) {
      console.error("Login failed:", error);
      alert("Something went wrong. Please try again.");
    }
  }

