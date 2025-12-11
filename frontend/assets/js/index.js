const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Show message function
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;

    setTimeout(() => {
        messageDiv.style.opacity = 0;
    }, 4000);
}

// ------------------------
//  REGISTER USER
// ------------------------
document.getElementById("submitSignUp").addEventListener("click", function (e) {
    e.preventDefault();

    const fname = document.getElementById("rFname").value.trim();
    const lname = document.getElementById("rLname").value.trim();
    const email = document.getElementById("rEmail").value.trim();
    const password = document.getElementById("rPassword").value.trim();
    const cpassword = document.getElementById("rCPassword").value.trim();

    if (!fname || !lname || !email || !password || !cpassword) {
        showMessage("Please fill out all fields.", "signUpMessage");
        return;
    }

    if (password !== cpassword) {
        showMessage("Passwords do not match.", "signUpMessage");
        return;
    }

    // Check if user already exists
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some(user => user.email === email);

    if (userExists) {
        showMessage("Email already registered. Please log in.", "signUpMessage");
        return;
    }

    // Save the new user
    const newUser = {
        fname,
        lname,
        email,
        password
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Registration successful! You can now log in.", "signUpMessage");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
});

// ------------------------
//  LOGIN USER
// ------------------------
document.getElementById("submitSignIn").addEventListener("click", function (e) {
    e.preventDefault();

    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value.trim();

    if (!email || !password) {
        showMessage("Please fill out all fields.", "signInMessage");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const validUser = users.find(user =>
        user.email === email && user.password === password
    );

    if (!validUser) {
        showMessage("Invalid credentials. Please try again.", "signInMessage");
        return;
    }

    // Save logged-in user data
    localStorage.setItem("loggedInUser", JSON.stringify(validUser));

    showMessage("Login successful! Redirecting...", "signInMessage");

    setTimeout(() => {
        window.location.href = "dashboard.html"; // Redirect
    }, 1500);
});


