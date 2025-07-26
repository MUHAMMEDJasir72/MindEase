export const validateForm = (username, email, password1, password2) => {
  const usernameRegex = /^(?=.*[A-Za-z])[A-Za-z0-9_]{3,20}$/;
  // ^ Must contain at least one letter, allows letters, numbers, underscores, length 3-20

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,30}$/;
  // ^ At least one letter and one number, 8-30 characters

  // Required field check
  if (!username || !email || !password1 || !password2) {
    return "All fields are required.";
  }

  // Username checks
  if (username.length > 20) {
    return "Username must not exceed 20 characters.";
  }
  if (!usernameRegex.test(username)) {
    return "Username must be 3–20 characters long, contain only letters, numbers, or underscores, and include at least one letter.";
  }

  // Email checks
  if (email.length > 50) {
    return "Email must not exceed 50 characters.";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  // Password checks
  if (password1.length > 30) {
    return "Password must not exceed 30 characters.";
  }
  if (!passwordRegex.test(password1)) {
    return "Password must be 8–30 characters long and include at least one letter and one number.";
  }

  // Confirm password match
  if (password1 !== password2) {
    return "Passwords do not match.";
  }

  return null; // Valid
};
