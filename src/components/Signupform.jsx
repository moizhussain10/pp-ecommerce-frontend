import React from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Signupform.css"; // animations & custom styles

const Signupform = ({ registeruser }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    registeruser({ email, password });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
      <Card className="p-4 shadow-lg signup-card animate-slide-up">
        <div className="text-center mb-3">
          <h3 className="fw-bold mb-1">Create an Account</h3>
          <p className="text-muted mb-0">Join PitchCraft today 🚀</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="example@email.com"
              required
              className="rounded-3 focus-glow"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="••••••••"
              minLength={6}
              required
              className="rounded-3 focus-glow"
            />
          </Form.Group>

          <Form.Group className="mb-3 d-flex justify-content-between align-items-center">
            <Form.Check
              type="checkbox"
              label="Remember me"
              name="remember"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2 fw-semibold rounded-3 signup-btn"
          >
            Sign Up
          </Button>
        </Form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Already have an account?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none text-primary">
              Login
            </Link>
          </small>
        </div>
      </Card>
    </div>
  );
};

export default Signupform;
