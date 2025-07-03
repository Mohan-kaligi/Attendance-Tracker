const api = "http://localhost:3000";
const today = new Date().toISOString().split("T")[0];
document.getElementById("todayDate").textContent = today;

const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) {
  window.location.href = "login.html";
}

const batch = user?.batch;
document.getElementById("batchName").textContent = batch;

document.getElementById("userName").textContent = `👤 ${user.name}`;
document.getElementById("userRole").textContent = `(${user.role})`;

document.getElementById("signOutBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
});



let students = [], attendanceHistory = [];

async function fetchData() {
  const [studentsRes, attendanceRes] = await Promise.all([
    fetch(`${api}/students?batch=${batch}`),
    fetch(`${api}/attendance?batch=${batch}`)
  ]);
  students = await studentsRes.json();
  attendanceHistory = await attendanceRes.json();
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("tr");

    const presentDays = attendanceHistory.filter(a =>
      a.students.find(s => s.name === student.name && s.status === "Present")
    ).length;

    const totalDays = attendanceHistory.length;
    const percentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : "-";

    const last3 = attendanceHistory.slice(-3).map(a => {
      const s = a.students.find(s => s.name === student.name);
      return s
        ? (s.status === "Present"
            ? "<span class='status-present'>P</span>"
            : "<span class='status-absent'>A</span>")
        : "-";
    }).join(" ");

    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>
        <select name="status_${student.id}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </td>
      <td>${percentage}%</td>
      <td>${last3}</td>
      <td>
       <button type="button" class="delete-btn" data-id="${student.id}">Delete</button>

      </td>
    `;

    row.querySelector(".delete-btn").addEventListener("click", async (e) => {
      const idToDelete = e.target.getAttribute("data-id");
      if (confirm(`Are you sure you want to delete student ID ${idToDelete}?`)) {
        await deleteStudent(idToDelete);
        fetchData();
      }
    });

    tbody.appendChild(row);
  });
}

document.getElementById("addStudentForm").addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();

  if (!id || !name) return;

  // Check for duplicate ID
  const duplicate = students.find(s => s.id === id);
  if (duplicate) {
    alert(`Student with ID "${id}" already exists!`);
    return;
  }

  await fetch(`${api}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, batch })
  });

  document.getElementById("studentId").value = "";
  document.getElementById("studentName").value = "";
  fetchData();
});


document.getElementById("attendanceForm").addEventListener("submit", async e => {
  e.preventDefault();
  const attendanceList = students.map(student => {
    const status = document.querySelector(`select[name=status_${student.id}]`).value;
    return { name: student.name, status };
  });

  const exists = await fetch(`${api}/attendance?batch=${batch}&date=${today}`).then(res => res.json());
  if (exists.length > 0) {
    alert("Attendance for today already submitted.");
    return;
  }

  await fetch(`${api}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batch, date: today, students: attendanceList })
  });

  alert("Attendance saved!");
  fetchData();
});

async function deleteStudent(id) {
  await fetch(`${api}/students/${id}`, {
    method: "DELETE"
  });
}

fetchData();
