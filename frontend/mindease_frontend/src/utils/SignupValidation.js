// Frontend form validation to match backend rules
export function SignupValidation(fullName, email, age, place, gender, language, phone, password1, password2) {

    if (!fullName || !email || !age || !place || !gender || !language || !phone || !password1 || !password2) {
        return "All fields are required.";
    }

  // Full Name (letters only, 3–20 chars)
  if (!/^[A-Za-z]{3,20}$/.test(fullName)) {
    return "Fullname must contain only letters and be 3–20 characters long.";
  }

  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email format.";
  }

  // Age (1–150)
  if (!/^\d+$/.test(age) || parseInt(age) < 1 || parseInt(age) > 150) {
    return "Age must be a number between 1 and 150.";
  }

  // Place (letters + spaces, 3–50 chars)
  if (!/^[A-Za-z\s]{3,50}$/.test(place)) {
    return "Place must contain only letters and be 3–50 characters long.";
  }

  // Gender
  if (!gender) {
    return "Please select a gender.";
  }

  // Language (letters + spaces, 2–30 chars)
  if (!/^[A-Za-z\s]{2,30}$/.test(language)) {
    return "Language must contain only letters and be 2–30 characters long.";
  }

  // Phone number (+ optional, no leading 0, 9–15 digits)
  if (!/^\+?[1-9]\d{8,14}$/.test(phone)) {
    return "Invalid phone number format.";
  }

  if (
    password1.length < 8 ||
    password1.length > 30 ||
    !/\d/.test(password1) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password1)
  ) {
    return "Password must be 8–30 characters long and include a number and a special character.";
  }

  // Passwords match
  if (password1 !== password2) {
    return "Passwords do not match.";
  }

  // Password strength (8–30 chars, must include number + special char, spaces not allowed)
  

  return null; // ✅ Valid form
}
