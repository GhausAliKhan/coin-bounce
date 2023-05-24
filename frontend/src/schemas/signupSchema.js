import * as yup from "yup";
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-z-A-Z\d]{8,25}$/;
const errorMessage = "use lowercase, uppercase, digit";

const signupSchema = yup.object().shape({
  name: yup.string().max(30).required("name is required"),
  username: yup.string().min(6).max(30).required(),
  email: yup
    .string()
    .email("enter a valid email")
    .required("email is required"),
  password: yup
    .string()
    .min(8)
    .max(25)
    .matches(passwordPattern, { message: errorMessage })
    .required("password is required"),
  confirmpassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password must match Passwords")
    .required("confirm password is required"),
});
export default signupSchema;
