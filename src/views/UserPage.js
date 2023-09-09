import { useEffect, useState } from "react";
import { Container, Row, Card } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from "../components/NavBar";
import { isArrayEmpty } from "../common/common";
import img from '../assets/background.jpg'

export default function UserPage() {
  const [tips, setTips] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [votedtips, setVotedTips] = useState([]);
  const [votedquestions, setVotedQuestions] = useState([]);
  const params = useParams();
  const userid = params.userid;
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const getUserEntries = async () => {
    const query = await getDoc(doc(db, "users", userid)); //retrieve data from db users
    const user = query.data();

    if (!isArrayEmpty(user.tips)) {
      const newTips = user.tips.map(async (doc) => {
        const tip = await getDoc(doc);
        const tipData = tip.data();
        const tipId = tip._key.path.segments[tip._key.path.segments.length - 1];
        return ({ id: tipId, ...tipData });
      });

      setTips(await Promise.all(newTips));
    }

    if (!isArrayEmpty(user.questions)) {
      const newQuestions = user.questions.map(async (doc) => {
        const question = await getDoc(doc);
        const questionData = question.data();
        const questionId =
          question._key.path.segments[question._key.path.segments.length - 1];
        return ({ id: questionId, ...questionData });
      });

      setQuestions(await Promise.all(newQuestions));
    }

    if (!isArrayEmpty(user.tipvote.upvote)) {
      const votedTips = user.tipvote.upvote.map(async (tipid) => {
        const tip = await getDoc(doc(db, "tips", tipid));
        console.log('heres: ' + JSON.stringify(tip.data()))
        return({id: tip.id, ...tip.data()});
      });
      
      setVotedTips(await Promise.all(votedTips));
    }

    if (!isArrayEmpty(user.questionvote.upvote)) {
      const votedQuestions = user.questionvote.upvote.map(async (qid) => {
        const question = await getDoc(doc(db, "qna", qid));
        return({ id: question.id, ...question.data() });
      });

      setVotedQuestions(await Promise.all(votedQuestions));
    }
  };

  // async function getAlltips() {
  //   const query = await getDocs(collection(db, "tips")); //retrieve data from collection tips
  //   const tips = query.docs.map((doc) => {
  //     return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
  //   });

  // }

  // async function getAllQuestions() {
  //   const query = await getDocs(collection(db, "qna")); //retrieve data from collection tips
  //   const questions = query.docs.map((doc) => {
  //     return { id: doc.id, ...doc.data() }; // set id with the auto-id and then the image and caption
  //   });
  //   setQuestions(questions);
  // }

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/signin");
    //getAlltips();
    getUserEntries();
    //getAllQuestions();
  }, [loading, user]);

  const TipsRow = ({tips}) => {
    console.log(JSON.stringify(tips) + " _ " + !isArrayEmpty(tips));
    let newTips = [];
    if (!isArrayEmpty(tips)) {
      newTips = tips.sort((a, b) => {
        let voteA = a.upvote - a.downvote;
        let voteB = b.upvote - b.downvote;
        return voteB - voteA;
      });
    }
    return newTips.map((tip, index) => {
      let component = "";
      component = <TipCard key={index} tip={tip} />;
      return component;
    });
  };

  const QuestionRow = ({questions}) => {
    let newQuestions = [];
    console.log(JSON.stringify(questions) + " _ " + !isArrayEmpty(questions));
    if (!isArrayEmpty(questions)) {
      newQuestions = questions.sort((a, b) => {
        let voteA = a.upvote - a.downvote;
        let voteB = b.upvote - b.downvote;
        return voteB - voteA;
      });
    }
    return newQuestions.map((question, index) => {
      let component = "";
      component = <QuestionCard key={index} question={question} />;
      return component;
    });
  };
  return (
    <div style={{backgroundImage:`url(${img})`, backgroundSize: 'cover', height:'100%', minHeight:'100vh'}}>
      <NavBar
        user={user}
        handleSignOut={() => {
          signOut(auth);
        }}
      />
      <Container>
        <h2 className="my-4 text-center">
          <u>User Page</u>
        </h2>
        <Row className="mt-4">
          <h3>Your Tips</h3>
          <Card>
            <Card.Body style={{ maxHeight: "19rem", overflowY: "auto" }}>
              <TipsRow tips={tips} />
            </Card.Body>
          </Card>
        </Row>
        <Row className="pt-4">
          <h3>Your Questions</h3>
          <Card>
            <Card.Body style={{ maxHeight: "19rem", overflowY: "auto" }}>
              <QuestionRow questions={questions} />
            </Card.Body>
          </Card>
        </Row>
        <Row className="pt-4">
          <h3>Tips that you upvote</h3>
          <Card>
            <Card.Body style={{ maxHeight: "19rem", overflowY: "auto" }}>
              <TipsRow tips={votedtips} />
            </Card.Body>
          </Card>
        </Row>
        <Row className="pt-4 mb-5">
          <h3>Questions that you upvote</h3>
          <Card>
            <Card.Body style={{ maxHeight: "19rem", overflowY: "auto" }}>
              <QuestionRow questions={votedquestions} />
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

function QuestionCard({ question }) {
  const { title, upvote, downvote, id } = question;
  return (
    <Link
      to={`question/${id}`}
      style={{
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
