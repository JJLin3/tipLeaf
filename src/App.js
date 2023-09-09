import { library } from "@fortawesome/fontawesome-svg-core";
import "./App.css";

//import your icons
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./views/HomePage";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import UserPage from "./views/UserPage";
import NoMatch from "./views/NoMatch";
import QuestionPage from "./views/QuestionPage";
import TipPageDetails from "./views/TipPageDetails";
import AddTipPage from "./views/AddTipPage";
import AddQuestionPage from "./views/AddQuestionPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tip/:tid" element={<TipPageDetails />} />
        <Route path="/addtip" element={<AddTipPage />} />
        <Route path="/question/:qid" element={<QuestionPage />} />
        <Route path="/addquestion" element={<AddQuestionPage />} />
        <Route path="/user/:userid">
          <Route index element={<UserPage />} />
          <Route path="tip">
            <Route index path=":tid" element={<TipPageDetails />} />
          </Route>
          <Route path="question">
            <Route index path=":qid" element={<QuestionPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

library.add(fas, far);
