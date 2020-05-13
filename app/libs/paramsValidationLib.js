let Email = (email) => {
  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  if (email.match(emailRegex)) {
    return email
  } else {
    return false
  }
}

/* Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter */
let Password = (password) => {
  let passwordRegex = /^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/
  if (password.match(passwordRegex)) {
   
    return password
  } else {
    console.log(password);
    return false
  }
}
//end of Password  function

//function to validate mobile number
let mobileNumberVerify = (mobileNumber) => {
  if (/^\d{10}$/.test(mobileNumber)) {
    return true;
  } else {
    return false;
  }
}
//end of mobileNumberVerify

module.exports = {
  Email: Email,
  Password: Password,
  mobileNumberVerify: mobileNumberVerify
}
