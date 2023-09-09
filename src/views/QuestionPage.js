import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";
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
  addDoc,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from "../components/NavBar";
import img from '../assets/background3.jpg'

export default function QuestionPage() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [authoredBy, setAuthoredBy] = useState("");
  const [lastAuthoredOn, setLastAuthoredOn] = useState("");
  const [upvote, setUpvote] = useState(0);
  const [downvote, setDownvote] = useState(0);
  const [upvoteStatus, setUpvoteStatus] = useState(false);
  const [downvoteStatus, setDownvoteStatus] = useState(false);
  const [vote, setVote] = useState({});
  const params = useParams();
  const id = params.qid;
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [initialUpvote, setInitalUpvote] = useState(0);
  const [initialDownvote, setInitalDownvote] = useState(0);
  const [editsavestatus, setEditSaveStatus] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [answerStatus, setAnswerStatus] = useState([]);
  // const [initansvote, setInitAnsVote] = useState([]);
  // const [ansvoteStatus, setAnsVoteStatus]= useState([]);

  async function getQuestion(id, user) {
    const qnaDocument = await getDoc(doc(db, "qna", id)); //get this post from the db called qna
    const question = qnaDocument.data();
    setTitle(question.title);
    setQuestion(question.question);
    setAuthoredBy(question.authoredby);
    setLastAuthoredOn(question.lastauthoredon.toDate().toLocaleString());
    setUpvote(question.upvote);
    setDownvote(question.downvote);
    setInitalUpvote(question.upvote);
    setInitalDownvote(question.downvote);

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
        setVote(item.questionvote);
        setUsername(item.username);

        if (
          item.questionvote.upvote !== undefined &&
          item.questionvote.downvote !== undefined
        ) {
          if (item.questionvote.upvote.includes(id)) {
            setUpvoteStatus(true);
            setDownvoteStatus(false);
            setInitalUpvote(upvote - 1);
          } else if (item.questionvote.downvote.includes(id)) {
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

  async function getAnswers() {
    const newAnswers = await getDocs(collection(db, "qna", id, "answers"));
     const ans = newAnswers.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });
    setAnswers(ans);
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
      await updateDoc(doc(db, "qna", id), { upvote: counter });

      await updateDoc(doc(db, "users", userId), {
        questionvote: { upvote: upvoteArray, downvote: downvoteArray },
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
    //const docRef = doc(db, "qna", id);

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
      await updateDoc(doc(db, "qna", id), { downvote: counter });

      await updateDoc(doc(db, "users", userId), {
        questionvote: { upvote: upvoteArray, downvote: downvoteArray },
      });
    } else {
      navigate("/signin");
    }
  };

  const handleEditSave = async () => {
    if (editsavestatus) {
      await updateDoc(doc(db, "qna", id), {
        title: title,
        question: question,
        lastauthoredon: Timestamp.now(),
      });
    }
    setEditSaveStatus(!editsavestatus);
  };

  const deleteQuestion = async (id) => {
    await deleteDoc(doc(db, "qna", id)); //delete this post from the db called qna
    if (upvote || downvote) {
      let upvoteArray = vote.upvote.filter((item) => item !== id);
      let downvoteArray = vote.downvote.filter((item) => item !== id);

      await updateDoc(doc(db, "users", userId), {
        questionvote: { upvoteArray, downvoteArray },
      });
    }

    if (username === authoredBy) {
      const user = await getDoc(doc(db, "users", userId));
      const question = user
        .data()
        .questions.filter((item) => !item._key.path.segments.includes(id));
      await updateDoc(doc(db, "users", userId), {
        questions: question,
      });
    }

    navigate(`/user/${userId}`);
  };

  const toggleAnswer = async (index) => {
    let ans = [...answers][index];
    let status = [...answerStatus];
    status[index] = !answerStatus[index];
    setAnswerStatus(status);
    console.log(ans)

    if (status[index] === false) {
      await updateDoc(doc(db, "qna", id, "answers", ans.id), {
        answer: ans.answer,
        authoredby: username,
        downvote: 0,
        lastauthoredon: Timestamp.now(),
        upvote: 0,
      });
    }
  };

  const handleDeleteAnswer = async (index) => {
    // delete comment object from the answers array and the comment array in the db
    let newAnswers = [...answers];
    const ansId = answers[index].id;
    let newAnswerStatus = [...answerStatus];

    newAnswers.splice(index, 1);
    newAnswerStatus.splice(index, 1);

    setAnswers(newAnswers);
    setAnswerStatus(newAnswerStatus);

    await deleteDoc(doc(db, "qna", id, "answers", ansId));
  };

  const handleAddAnswer = async () => {
    // add a new comment object to the answers array
    let newAnswers = [...answers];
    let newAnswerStatus = [...answerStatus];
    //let ansvoteStatus = [...ansvoteStatus];
      await addDoc(collection(db, "qna", id, "answers"),{
      answer: "",
      authoredby: username,
      downvote: 0,
      lastauthoredon: Timestamp.now(),
      upvote: 0,
    });
    newAnswers.push({
      answer: "",
      authoredby: username,
      downvote: 0,
      lastauthoredon: null,
      upvote: 0,
    });
    //wait updateDoc(doc(db, "posts", id), { answers: newAnswers });
    newAnswerStatus.push(false);
    //ansvoteStatus.push({upvote: false, downvote: false})
    setAnswers(newAnswers);
    setAnswerStatus(newAnswerStatus);
    //setAnsVoteStatus(ansvoteStatus)
  };

  // const handleCommentDownvote = async(index, answerdownvote, answerupvote) => {
  //   // toggle and send the like status to the db
  //   let counter = answerdownvote;
  //   let upvoteArray = answerupvote;
  //   let downvoteArray = answerdownvote;

  //   if (user) {
  //     if (!ansvoteStatus[index].downvote) {
  //       counter += 1;
  //       upvoteArray.splice(answerupvote.indexOf(id), 1);
  //       downvoteArray.push(id);
  //     } else {
  //       counter -= 1;
  //       downvoteArray.splice(vote.downvote.indexOf(id), 1);
  //     }

  //     setDownvote(counter);
  //     setVote((existingValues) => ({
  //       // Retain the existing values
  //       ...existingValues,
  //       // update downvote array
  //       downvote: downvoteArray,
  //     }));
  //     setDownvoteStatus(!downvoteStatus);
  //     await updateDoc(doc(db, "qna", id), { downvote: counter });

  //     await updateDoc(doc(db, "users", userId), {
  //       questionvote: { upvote: upvoteArray, downvote: downvoteArray },
  //     });
  //   } else {
  //     navigate("/signin");
  //   }
  // }

  useEffect(() => {
    if (loading) return;
    //if (!user) navigate("/signin");
    getQuestion(id, user);
    getAnswers();
  }, [id, navigate, user, loading, editsavestatus, answerStatus]);

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
                                username === authoredBy ? "default" : "pointer",
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
                                username === authoredBy ? "default" : "pointer",
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
                        {username === authoredBy && user ? (
                          <Col xs={2}>
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
                                deleteQuestion(id);
                              }}
                            >
                              Delete
                            </Card.Link>
                          </Col>
                        ) : (
                          ""
                        )}
                      </Row>
                      <Row>
                        <Col>
                          {editsavestatus ? (
                            <Form>
                              <Form.Group className="mb-3" controlId="question">
                                <Form.Label>Article</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={10}
                                  value={question}
                                  onChange={(text) =>
                                    setQuestion(text.target.value)
                                  }
                                />
                              </Form.Group>
                            </Form>
                          ) : (
                            <Card.Text>{question}</Card.Text>
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

        <Row className="mt-4 px-3">
          <Card>
            <Card.Title>Answer</Card.Title>
            <Card.Body style={{maxHeight:'35rem', overflowY:'auto'}}>
              <ListGroup style={{ paddingTop: "10px" }}>
                {answers.map((item, index) => (
                  <ListGroupItem key={index}>
                    <Container>
                      <Row>
                        <Col xs="auto" className="text-center">
                        {/* {user ? (
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <FontAwesomeIcon
                            icon={
                              ansvoteStatus[index].upvote
                                ? "fa-solid fa-arrow-alt-circle-up"
                                : "fa-regular fa-arrow-alt-circle-up"
                            }
                            size="xl"
                            style={{
                              cursor:
                                username === item.authoredby ? "default" : "pointer",
                            }}
                            onClick={(e) => {
                              if (username !== item.authoredby && user) {
                                if (ansvoteStatus[index].downvote) {
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
                              ansvoteStatus[index].downvote
                                ? "fa-solid fa-arrow-alt-circle-down"
                                : "fa-regular fa-arrow-alt-circle-down"
                            }
                            size="xl"
                            style={{
                              cursor:
                                username === item.authoredby ? "default" : "pointer",
                            }}
                            onClick={(e) => {
                              if (username !== item.authoredby && user) {
                                handleCommentDownvote(index, item.downvote, item.upvote)
                              }
                            }}
                          />
                        </div>
                      ) : (
                        ""
                      )} */}
                        </Col>
                        <Col>
                        {!answerStatus[index] ? (
                      <p>{item.answer}</p>
                    ) : (
                      <Form>
                        <Form.Group className="mb-3" controlId="answer">
                          <Form.Label>Answer</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={10}
                            value={answers[index].answer}
                            onChange={(text) => {
                              let newAnswers = [...answers];
                              newAnswers[index].answer = text.target.value;
                              setAnswers(newAnswers);
                            }}
                          />
                        </Form.Group>
                      </Form>
                    )}
                        </Col>
                        <Col xs={2} className="text-center">
                        {username === item.authoredby && user ? (
                      <>
                        <Card.Link
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleAnswer(index)}
                        >
                          Edit
                        </Card.Link>
                        <Card.Link
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleDeleteAnswer(index);
                          }}
                        >
                          Delete
                        </Card.Link>
                      </>
                    ) : (
                      ""
                    )}
                        </Col>
                        <Col xs={2} className="text-center">
                        <p>
                        <strong>Authored By</strong>
                        {`: ${answers[index].authoredby}`}
                      </p>
                      <p>
                        <strong>Last Authored On</strong>
                        {answers[index].lastauthoredon ?  `: ${answers[index].lastauthoredon.toDate().toLocaleString()}` : ""}
                      </p>
                        </Col>
                      </Row>
                    </Container>
                  </ListGroupItem>
                ))}
                {user ?
                <Button
                className="mt-2"
                onClick={() => {
                  if(user){
                    handleAddAnswer();
                  }
                }}
              >
                Add
              </Button> :""}
              </ListGroup>
            </Card.Body>
          </Card>
        </Row>
      </Container>
    </div>
  );
}
