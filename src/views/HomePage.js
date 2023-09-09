import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Card,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from "../components/NavBar";
import img from "../assets/background.jpg";

export default function HomePage() {
  const [tips, setTips] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [searchTip, setSearchTip] = useState("");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [user] = useAuthState(auth);

  async function getAllTips() {
    const query = await getDocs(collection(db, "tips")); //retrieve data from collection tips
    const tips = query.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });
    setTips(tips);
  }

  async function getAllQuestions() {
    const query = await getDocs(collection(db, "qna")); //retrieve data from collection qna
    const questions = query.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });
    setQuestions(questions);
  }

  useEffect(() => {
    getAllTips();
    getAllQuestions();
  }, []);

  const TipsRow = () => {
    const newTips = tips.sort((a, b) => {
      let voteA = a.upvote - a.downvote;
      let voteB = b.upvote - b.downvote;
      return voteB - voteA;
    });
    return newTips.map((tip, index) => {
      let component = "";
      component = <TipCard key={index} tip={tip} />;
      // if (index < 10) {
      //   component = <TipCard key={index} tip={tip} />;
      // }
      return component;
    });
  };

  const QuestionRow = () => {
    const newQuestions = questions.sort((a, b) => {
      let voteA = a.upvote - a.downvote;
      let voteB = b.upvote - b.downvote;
      return voteB - voteA;
    });
    return newQuestions.map((question, index) => {
      let component = "";
      component = <QuestionCard key={index} question={question} />;
      // if (index < 3) {
      //   component = <QuestionCard key={index} question={question} />;
      // }
      return component;
    });
  };

  const handleSearchTip = async (e) => {
    const q = await getDocs(
      query(collection(db, "tips"), where("title", "==", searchTip))
    );

    const tips = q.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });

    setTips(tips);
  };

  const handleSearchQuestion = async (e) => {
    const q = await getDocs(
      query(collection(db, "qna"), where("title", "==", searchQuestion))
    );

    const questions = q.docs.map((doc) => {
      return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
    });

    setQuestions(questions);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        height: "100%",
        minHeight: "100vh",
      }}
    >
      <NavBar
        user={user}
        handleSignOut={() => {
          signOut(auth);
        }}
      />

      <Container>
        <Row className="mt-4">
          <h3>Tips for your plant</h3>
          <Card className="pb-4">
            {/* <InputGroup className="p-3">
              <Form.Control
                placeholder="Search for tip here"
                aria-label="Tips"
                aria-describedby="basic-addon1"
                value={searchTip}
                onChange={(e) => setSearchTip(e.target.value)}
              />
              <Button
                variant="outline-primary"
                id="button-addon1"
                onClick={(e) => {
                  handleSearchTip(e);
                }}
              >
                Search
              </Button>
            </InputGroup> */}
            <Card.Body style={{ maxHeight: "20rem", overflowY: "auto" }}>
              <TipsRow />
            </Card.Body>
          </Card>
        </Row>
        <Row className="mt-4">
          <h3>Questions asked</h3>
          <Card className="mt-4 pb-4">
          {/* <InputGroup className="p-3">
              <Form.Control
                placeholder="Search for question here"
                aria-label="Questions"
                aria-describedby="basic-addon1"
                value={searchQuestion}
                onChange={(e) => setSearchQuestion(e.target.value)}
              />
              <Button
                variant="outline-primary"
                id="button-addon1"
                onClick={(e) => {
                  handleSearchQuestion(e);
                }}
              >
                Search
              </Button>
            </InputGroup> */}
            <Card.Body style={{ maxHeight: "20rem", overflowY: "auto" }}>
              <QuestionRow />
            </Card.Body>
          </Card>
        </Row>
      </Container>
    </div>
  );
}

function TipCard({ tip }) {
  const { title, upvote, downvote, id } = tip;
  return (
    <Link
      to={`tip/${id}`}
      style={{
        width: "18rem",
        marginLeft: "1rem",
        marginTop: "2rem",
        textDecoration: "none",
      }}
    >
      <Card>
        <Card.Body>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h4 style={{ paddingRight: "20px" }}>{title}</h4>
            <>
              <FontAwesomeIcon
                icon="fa-solid fa-arrow-alt-circle-up"
                size="xl"
                style={{ paddingRight: "10px" }}
              />
              {upvote - downvote}
              <FontAwesomeIcon
                icon="fa-solid fa-arrow-alt-circle-down"
                size="xl"
                style={{ paddingLeft: "10px" }}
              />
            </>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

function QuestionCard({ question }) {
  const { title, upvote, downvote, id } = question;
  return (
    <Link
      to={`question/${id}`}
      style={{
        width: "18rem",
        marginLeft: "1rem",
        marginTop: "2rem",
        textDecoration: "none",
      }}
    >
      <Card>
        <Card.Body>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h4 style={{ paddingRight: "20px" }}>{title}</h4>
            {upvote - downvote > 0 ? (
              <>
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-alt-circle-up"
                  size="xl"
                  style={{ paddingRight: "10px" }}
                />
                {upvote - downvote}
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-alt-circle-down"
                  size="xl"
                  style={{ paddingLeft: "10px" }}
                />
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-alt-circle-up"
                  size="xl"
                  style={{ paddingRight: "10px" }}
                />
                0
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-alt-circle-down"
                  size="xl"
                  style={{ paddingLeft: "10px" }}
                />
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}
