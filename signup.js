document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.querySelector('input[placeholder="Full Name"]').value.trim();
    const email = document.querySelector('input[placeholder="Email"]').value.trim();
    const password = document.querySelector('input[placeholder="Password"]').value.trim();
    const batch = document.querySelector('input[placeholder*="Batch"]').value.trim();
    const phone = document.querySelector('input[placeholder="Phone Number"]').value.trim();

    const userData = {
      name,
      email,
      password,
      batch,
      phone,
      role: "batchOwner"
    };
    try {
      const checkUser = await fetch(`http://localhost:3000/users?email=${email}`);
      const existing = await checkUser.json();
      if (existing.length > 0) {
        alert("User already exists with this email.");
        return;
      }

      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert("Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong.");
    }
  });
