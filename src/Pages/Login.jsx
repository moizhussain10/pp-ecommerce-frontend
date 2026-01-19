import React from "react";
import { signInWithEmailAndPassword, auth } from "../Config/firebase.js";
import Loginform from "../components/Loginform";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  let navigate = useNavigate();

  const signinuser = (values) => {  

    const loading = toast.loading("Loging You In...");
    console.log("Trying to login with:", values);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        console.log("Login success:", userCredential.user);
        toast.dismiss(loading);
        toast.success('Login Successfully! Welcome Back.');        
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log("Firebase login error:", error.code, error.message);
      });
  };

  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <Loginform signinuser={signinuser} />
    </div>
  );
}

export default Login;
