import { useState } from "react";
import { Button, Container, Form, Card } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import NavBar from "../components/NavBar";
import img from '../assets/background4.jpg'

export default function SignUp() {
    const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSignUp = async(e) => {
    const canSignUp = username && password;
    if (canSignUp) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, "users"), {username: username, questionvote: {upvote:[], downvote: []}, tipvote: {upvote:[], downvote: []}, email: email, tips: [], questions: []})
        navigate("/");
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Please fill in all the fields.");
    }
  };

  return (
    <div style={{backgroundImage:`url(${img})`, backgroundSize: 'cover', height:'100%', minHeight:'100vh'}}>   
   <NavBar isSignUp />
          <Container className="mt-4">
      <Card className="mx-auto">
        <Card.Body>
          <h1 className="my-3">Sign up for an account</h1>
          <Form>
          <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
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
                  handleSignUp(e)
                }}
              >
                Sign Up
              </Button>
            </div>
          </Form>
          <p>{error}</p>
        </Card.Body>
      </Card>
    </Container>
    </div>
  );
}
