import React from 'react'
import Signupform from "../components/Signupform"
import { createUserWithEmailAndPassword, auth } from '../Config/firebase.js.js';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {

  let navigate = useNavigate()

  const registeruser = (values) => {
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        const user = userCredential.user;
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