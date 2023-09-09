import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { addDoc, collection, getDocs, where, query, Timestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import NavBar from "../components/NavBar";
import img from '../assets/background2.jpg'

export default function AddTipPage() {
  //auth is credential, return user which is a boolean value on whether the user is authenticate and loading during authentication
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  async function addTip() {

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
        userId = doc.id;
        username = item.username;
      });
    }

    const newuser = await getDoc(doc(db, 'users', userId));
    const tips = newuser.data().tips;
    
    //Add the document to Cloud Firestore
    await addDoc(collection(db, "tips"), {
      title: title,
      content: content,
      lastauthoredon: Timestamp.now(),
      authoredby: username,
      upvote: 0,
      downvote: 0
    }).then((docRef) => {
      tips.push(docRef)
      updateDoc(doc(db, "users", userId), { tips: tips }); //create a reference data type which is like a foreign key
  });
    

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
        <h1 style={{ marginBlock: "1rem" }}>Add Tip</h1>
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

          <Form.Group className="mb-3" controlId="content">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={content}
              onChange={(text) => setContent(text.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={async (e) => addTip()}>
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}
