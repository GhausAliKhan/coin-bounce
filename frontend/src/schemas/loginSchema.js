import * as yup from "yup";
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-z-A-Z\d]{8,25}$/;
const errorMessage =
  "Use atleast 1 lowercase, 1 upper case and a digit to match password Pattern";

const loginSchema = yup.object().shape({
  username: yup.string().min(6).max(30).required("username is required"),
  password: yup
    .string()
    .min(8)
    .max(25)
    .matches(passwordPattern, { message: errorMessage })
    .required(),
});
export default loginSchema;
