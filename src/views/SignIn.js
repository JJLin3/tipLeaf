import { useState } from "react";
import { Button, Container, Form, Card } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import NavBar from "../components/NavBar";
import img from '../assets/background4.jpg'

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <div style={{backgroundImage:`url(${img})`, backgroundSize: 'cover', height:'100%', minHeight:'100vh'}}>
      <NavBar isSignIn />
      <Container className="mt-4">
        <Card className="mx-auto">
          <Card.Body>
            <h1 className="my-3">Sign in to your account</h1>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <div className="d-grid gap-1">
                <Button
                  variant="primary"
                  onClick={async (e) => {
                    setError("");
                    const canLogin = email && password;
                    if (canLogin) {
                      try {
                        await signInWithEmailAndPassword(auth, email, password);
                        navigate("/");
                      } catch (error) {
                        setError(error.message);
                      }
                    } else {
                      setError("Please fill in all the fields");
                    }
                  }}
                >
                  Sign In
                </Button>
                <a href="/signup">Sign up for a new account</a>
              </div>
            </Form>
            <p>{error}</p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
