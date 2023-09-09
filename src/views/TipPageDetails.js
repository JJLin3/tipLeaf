import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  where,
  query,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from "../components/NavBar";
import img from '../assets/background3.jpg'

export default function TipPageDetails() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authoredBy, setAuthoredBy] = useState("");
  const [lastAuthoredOn, setLastAuthoredOn] = useState("");
  const [upvote, setUpvote] = useState(0);
  const [downvote, setDownvote] = useState(0);
  const [upvoteStatus, setUpvoteStatus] = useState(false);
  const [downvoteStatus, setDownvoteStatus] = useState(false);
  const [vote, setVote] = useState({});
  const params = useParams();
  const id = params.tid;
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [initialUpvote, setInitalUpvote] = useState(0);
  const [initialDownvote, setInitalDownvote] = useState(0);
  const [editsavestatus, setEditSaveStatus] = useState(false);

  async function getTip(id, user) {
    const tipDocument = await getDoc(doc(db, "tips", id)); //get this post from the db called tips
    const tip = tipDocument.data();
    setTitle(tip.title);
    setContent(tip.content);
    setAuthoredBy(tip.authoredby);
    setLastAuthoredOn(tip.lastauthoredon.toDate().toLocaleString());
    setUpvote(tip.upvote);
    setDownvote(tip.downvote);
    setInitalUpvote(tip.upvote);
    setInitalDownvote(tip.downvote);

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
        setUserId(doc.id);
        setVote(item.tipvote);
        setUsername(item.username);

        if (
          item.tipvote.upvote !== undefined &&
          item.tipvote.downvote !== undefined
        ) {
          if (item.tipvote.upvote.includes(id)) {
            setUpvoteStatus(true);
            setDownvoteStatus(false);
            setInitalUpvote(upvote - 1);
          } else if (item.tipvote.downvote.includes(id)) {
            setUpvoteStatus(false);
            setDownvoteStatus(true);
            setInitalDownvote(downvote - 1);
          } else {
            setUpvoteStatus(false);
            setDownvoteStatus(false);
          }
        }
      });
    }
  }

  const handleUpvote = async (e) => {
    // toggle and send the like status to the db
    let counter = upvote;
    let downvoteArray = vote.downvote;
    let upvoteArray = vote.upvote;
    //const docRef = doc(db, "tips", id);

    if (user) {
      if (!upvoteStatus) {
        counter += 1;
        downvoteArray.splice(vote.downvote.indexOf(id), 1);
        upvoteArray.push(id);
      } else {
        counter -= 1;
        upvoteArray.splice(vote.upvote.indexOf(id), 1);
      }
      setUpvote(counter);
      setVote((existingValues) => ({
        // Retain the existing values
        ...existingValues,
        // update upvote array
        upvote: upvoteArray,
      }));
      setUpvoteStatus(!upvoteStatus);
      await updateDoc(doc(db, "tips", id), { upvote: counter });

      await updateDoc(doc(db, "users", userId), {
        tipvote: {upvote: upvoteArray, downvote: downvoteArray}
      });
    } else {
      navigate("/signin");
    }
  };

  const handleDownvote = async (e) => {
    // toggle and send the like status to the db
    let counter = downvote;
    let upvoteArray = vote.upvote;
    let downvoteArray = vote.downvote;
    //const docRef = doc(db, "tips", id);

    if (user) {
      if (!downvoteStatus) {
        counter += 1;
        upvoteArray.splice(vote.upvote.indexOf(id), 1);
        downvoteArray.push(id);
      } else {
        counter -= 1;
        downvoteArray.splice(vote.downvote.indexOf(id), 1);
      }

      setDownvote(counter);
      setVote((existingValues) => ({
        // Retain the existing values
        ...existingValues,
        // update downvote array
        downvote: downvoteArray,
      }));
      setDownvoteStatus(!downvoteStatus);
      await updateDoc(doc(db, "tips", id), { downvote: counter });

      await updateDoc(doc(db, "users", userId), {
        tipvote: {upvote: upvoteArray, downvote: downvoteArray}
      });
    } else {
      navigate("/signin");
    }
  };

  const handleEditSave = async () => {
    if (editsavestatus) {
      await updateDoc(doc(db, "tips", id), {
        title: title,
        content: content,
        lastauthoredon: Timestamp.now(),
      });
    }
    setEditSaveStatus(!editsavestatus);
  };

  const deleteTip = async(id) => {
    await deleteDoc(doc(db, "tips", id)); //delete this post from the db called tips
    if(upvote|| downvote){
      let upvoteArray = vote.upvote.filter((item) => item !== id);
      let downvoteArray = vote.downvote.filter((item) => item !== id);
      
      await updateDoc(doc(db, "users", userId), {
        tipvote:{upvoteArray, downvoteArray}
      });
    }

    if(username === authoredBy){
      const newuser = await getDoc(doc(db, "users", userId));
      const tips = newuser.data().tips.filter((item) => !item._key.path.segments.includes(id))
      await updateDoc(doc(db, "users", userId), {
        tips: tips
      });
    }

    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    //if (loading) return;
    //if (!user) navigate("/signin");
    getTip(id, user);
  }, [id, navigate, user, loading, editsavestatus]);

  return (
    <div style={{backgroundImage:`url(${img})`, backgroundSize: 'cover', height:'100vh'}}>
      <NavBar
        user={user}
        handleSignOut={() => {
          signOut(auth);
        }}
      />
      <Container>
        <Row style={{ marginTop: "2rem" }}>
          <Col>
            <Card>
              <Card.Body>
                <Container>
                  <Row>
                    <Col xs="auto" className="text-center">
                      {user ? (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <FontAwesomeIcon
                            icon={
                              upvoteStatus
                                ? "fa-solid fa-arrow-alt-circle-up"
                                : "fa-regular fa-arrow-alt-circle-up"
                            }
                            size="xl"
                            style={{
                              cursor:
                                username === authoredBy
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={(e) => {
                              if (username !== authoredBy && user) {
                                if (downvoteStatus) {
                                  setDownvoteStatus(!downvoteStatus);
                                  setDownvote(initialDownvote);
                                }
                                handleUpvote(e);
                              }
                            }}
                          />
                          {upvote - downvote}
                          <FontAwesomeIcon
                            icon={
                              downvoteStatus
                                ? "fa-solid fa-arrow-alt-circle-down"
                                : "fa-regular fa-arrow-alt-circle-down"
                            }
                            size="xl"
                            style={{
                              cursor:
                                username === authoredBy
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={(e) => {
                              if (username !== authoredBy && user) {
                                if (upvoteStatus) {
                                  setUpvoteStatus(!upvoteStatus);
                                  setUpvote(initialUpvote);
                                }
                                handleDownvote(e);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </Col>
                    <Col>
                      <Row>
                        <Col>
                          {editsavestatus ? (
                            <Form>
                              <Form.Group className="mb-3" controlId="title">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Lovely day"
                                  value={title}
                                  onChange={(text) =>
                                    setTitle(text.target.value)
                                  }
                                />
                              </Form.Group>
                            </Form>
                          ) : (
                            <h3>{title}</h3>
                          )}
                        </Col>
                        {(username === authoredBy && user) ?<Col xs={2}>
                          <Card.Link
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              handleEditSave();
                            }}
                          >
                            {editsavestatus ? "Save" : "Edit"}
                          </Card.Link>
                          <Card.Link
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              deleteTip(id);
                            }}
                          >
                            Delete
                          </Card.Link>
                        </Col>: ""}
                      </Row>
                      <Row>
                        <Col>
                          {editsavestatus ? (
                            <Form>
                              <Form.Group className="mb-3" controlId="content">
                                <Form.Label>Article</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={10}
                                  value={content}
                                  onChange={(text) =>
                                    setContent(text.target.value)
                                  }
                                />
                              </Form.Group>
                            </Form>
                          ) : (
                            <Card.Text>{content}</Card.Text>
                          )}
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={2} className="text-center">
                      <p>
                        <strong>Authored By</strong>
                        {`: ${authoredBy}`}
                      </p>
                      <p>
                        <strong>Last Authored On</strong>
                        {`: ${lastAuthoredOn}`}
                      </p>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
