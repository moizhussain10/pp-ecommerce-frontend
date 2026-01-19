import React from 'react'
import Signupform from "../components/Signupform"
import { createUserWithEmailAndPassword, auth } from '../Config/firebase.js';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Signup() {

  let navigate = useNavigate()

  const registeruser = (values) => {

    const loading = toast.loading("Creating your account...");

    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;
        toast.dismiss(loading);
        toast.success('Signed Up Successfully! Welcome.');
        navigate("/login")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  return (
    <div style={{
      textAlign: "center"
    }}>
      <Signupform registeruser={registeruser} />
    </div>
  )
}

export default Signup