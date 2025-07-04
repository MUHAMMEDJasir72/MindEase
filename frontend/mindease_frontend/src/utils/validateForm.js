
export const validateForm = (username, email, password1, password2) => {
    if (!username || !email || !password1 || !password2) {
      return "All fields are required";
    }
  
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
  
    if (password1.length < 8) {
      return "Password must be at least 8 characters long";
    }
  
    if (password1 !== password2) {
      return "Passwords do not match";
    }



  
    return null; 
  };