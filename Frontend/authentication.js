// Firebase imports (already added in your HTML as a script module)
// No need to re-import here since you're using <script type="module"> in HTML
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration (already provided)
const firebaseConfig = {
  apiKey: "AIzaSyBw7PKLVobByYPvHQeFlcbQR6mBZ7u4toc",
  authDomain: "airscape-a562f.firebaseapp.com",
  projectId: "airscape-a562f",
  storageBucket: "airscape-a562f.appspot.com",
  messagingSenderId: "777570095182",
  appId: "1:777570095182:web:d287c2cb26a159101df31f",
  measurementId: "G-KXZ86K01H1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

console.log("Firebase Initialized");

// ============================
// TOGGLE SIGNUP / LOGIN CARDS
// ============================
const loginCard = document.querySelector(".auth-container .auth-card");
const signupCard = document.getElementById("signup-card");
const showSignupBtn = document.getElementById("show-signup");

showSignupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginCard.style.display = "none";
  signupCard.style.display = "block";
});

// OPTIONAL: Go back to Login from Signup
const showLoginBtn = document.createElement("p");
showLoginBtn.innerHTML = `Already have an account? <a href="#" id="show-login">Login</a>`;
signupCard.appendChild(showLoginBtn);

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "show-login") {
    signupCard.style.display = "none";
    loginCard.style.display = "block";
  }
});

// ============================
// SIGNUP FUNCTIONALITY
// ============================
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("fullname").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Basic validation
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log("Signup successful:", user);

      // OPTIONAL: You can add user displayName here if you're using Firebase Firestore or updating the profile.
      alert("Signup successful! Please log in.");

      // Redirect to login
      signupCard.style.display = "none";
      loginCard.style.display = "block";
    })
    .catch((error) => {
      console.error("Signup error:", error);
      alert(`Signup failed: ${error.message}`);
    });
});

// ============================
// LOGIN FUNCTIONALITY
// ============================
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Login successful
      const user = userCredential.user;
      console.log("Login successful:", user);

      alert(`Welcome back, ${user.email}!`);

      // Redirect or show main content
      window.location.href = "index.html"; // You can change this to your page
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert(`Login failed: ${error.message}`);
    });
});

// ============================
// PASSWORD TOGGLE FUNCTIONALITY
// ============================
const passwordToggles = document.querySelectorAll(".password-toggle i");

passwordToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const input = toggle.previousElementSibling;
    const type = input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);

    // Toggle icon (if you're using Font Awesome)
    toggle.classList.toggle("fa-eye");
    toggle.classList.toggle("fa-eye-slash");
  });
});

// Import Google Auth Provider
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// ============================
// GOOGLE SIGN-IN FUNCTIONALITY
// ============================
const googleSigninBtn = document.getElementById("google-signin-btn");

googleSigninBtn.addEventListener("click", (e) => {
  e.preventDefault();

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      console.log("Google Sign-In successful:", user);

      alert(`Welcome, ${user.displayName || user.email}!`);

      // Redirect to dashboard or another page
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Google Sign-In error:", error);
      alert(`Google Sign-In failed: ${error.message}`);
    });
});
