import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import img from '../assets/favicon.png'

export default function NavBar(props) {

  const [userid, setuserId] = useState("");
  const navigate = useNavigate();

  const getUserId = async(user) => {
    if (user) {
      // if user is login, retrieve the user info from the db whcih contain user email and array of postId which the user like
      const q = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", auth.currentUser.email)
        )
      );
      q.forEach((doc) => {
        setuserId(doc.id);
      })
    }
  }

  useEffect(() =>{
    getUserId(props.user)
  },[props.user]);
  return (
    <Navbar variant="light" bg="light">
      <Container>
        <Navbar.Brand href="/">TipLeaf</Navbar.Brand>
        <Nav>
          {(!props.isSignIn && !props.isSignUp) && <Nav.Link href="/addtip">New Tip</Nav.Link>}
          {(!props.isSignIn && !props.isSignUp) && (
            <Nav.Link href="/addquestion">New Question</Nav.Link>
          )}
          {!props.user && <Nav.Link href="/signin">Sign In</Nav.Link>}
          {props.user && (
            <Nav.Link onClick={props.handleSignOut}>🚪</Nav.Link>
          )}
          {props.user && <Navbar.Collapse className="justify-content-end">
          <FontAwesomeIcon
                  icon="fa-solid fa-user"
                  size="xl"
                  style={{ cursor:'pointer' }}
                  onClick={()=> {
                    navigate(`/user/${userid}`)
                  }}
                />
        </Navbar.Collapse>}
        </Nav>
      </Container>
    </Navbar>
  );
}
