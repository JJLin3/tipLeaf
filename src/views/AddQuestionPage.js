import { useEffect, useState } from "react";
import { Button, Container, Form} from "react-bootstrap";
import { Timestamp, addDoc, collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import NavBar from "../components/NavBar";
import img from '../assets/background2.jpg'

export default function AddQuestionPage(){
     //auth is credential, return user which is a boolean value on whether the user is authenticate and loading during authentication
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  async function addQuestion() {
    let username = "";
    let userId = "";

    if (user) {
      // if user is login, retrieve the user info from the db whcih contain user email and array of postId which the user like
      const q = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", auth.currentUser.email)
        )
      );
      q.forEach((doc) => {
        const item = doc.data();
        username = item.username;
        userId = doc.id;
      })
    }
    const newuser = await getDoc(doc(db, 'users', userId));
    const questions = newuser.data().questions;
   

    //Add the document to Cloud Firestore
    await addDoc(collection(db, "qna"), {
      title: title,
      question: question,
      lastauthoredon: Timestamp.now(),
      authoredby: username,
      upvote: 0,
      downvote: 0
    }).then((docRef) => {
      questions.push(docRef);
      updateDoc(doc(db, "users", userId), { questions: questions }); //create a reference data type which is like a foreign key
  });;
    navigate("/");
  }

  //We want to make sure the LOGGED IN user can add a post
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/signin"); //user isn't login, redirect user to login page
  }, [loading, user, navigate]);

  return (
    <div style={{backgroundImage:`url(${img})`, backgroundSize: 'cover', height:'100%', minHeight:'100vh'}}>
    <NavBar
        user={user}
        handleSignOut={()=>{
          signOut(auth)
        }}
      />
      <Container>
        <h1 style={{ marginBlock: "1rem" }}>Add Question</h1>
        <Form>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Lovely day"
              value={title}
              onChange={(text) => setTitle(text.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="question">
          <Form.Label>Question</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={question}
              onChange={(text) => setQuestion(text.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={async (e) => addQuestion()}>
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
};