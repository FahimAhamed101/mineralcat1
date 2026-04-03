import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LogIn from "../pages/auth/login/LogIn";
import SignIn from "../pages/auth/signIn/SignIn";
import ForgetFrom from "../pages/auth/forgottenPassword/ForgetFrom";
import VerifyOTP from "../pages/auth/OTP/VerifyOTP";
import SetPassword from "../pages/auth/setNewPassword/SetPassword";
import DashboardHome from "../pages/dashboard/home/DashboardHome";
import AllUsers from "../pages/dashboard/users/AllUsers";
import AllQuestions from "../pages/dashboard/questions/AllQuestions";
import Earning from "../pages/dashboard/earning/Earning";
import Subscription from "../pages/dashboard/subscription/Subscription";
import Faq from "../pages/dashboard/faq/Faq";
import Admin from "../lib/protector/Admin";
import Public from "../lib/protector/Public";
import PersonalInformation from "../pages/dashboard/personalProfile/PersonalInformation";
import Terms from "../pages/dashboard/Terms & Service/Terms";
import Editor from "../pages/dashboard/JodiEditor/Editor";
import ReadAloud from "../pages/dashboard/questions/speking/read-aloud/ReadAloud";
import Edit from "../pages/dashboard/questions/Edit/Edit";
import Add from "../pages/dashboard/questions/Add/Add";
import RepeatSentence from "../pages/dashboard/questions/speking/Repeat-Sentence/RepeatSentence";
import EditPricing from "../pages/dashboard/subscription/Edit-pricing";
import ResponseSitutation from "../pages/dashboard/questions/speking/response-situtation/Response-situtation";
import Short from "../pages/dashboard/questions/speking/short/Short";
import SummarizeWritten from "../pages/dashboard/questions/written/summarize-written/Summarize-written";
import EmailWrite from "../pages/dashboard/questions/written/email/Email";
import Fill_in_the_Blanks from "../pages/dashboard/questions/reading/fill_in_the_blanks/Fill_in_the_Blanks";
import AddFill from "../pages/dashboard/questions/reading/fill_in_the_blanks/AddFill";
import EditFill from "../pages/dashboard/questions/reading/fill_in_the_blanks/EditFill";
import Multi from "../pages/dashboard/questions/reading/multiPull/Multi";
import AddMultiple from "../pages/dashboard/questions/reading/multiPull/AddMulti";
import EditMulti from "../pages/dashboard/questions/reading/multiPull/EditMulti";
import Reorder from "../pages/dashboard/questions/reading/reorder/Reorder";
import AddReorder from "../pages/dashboard/questions/reading/reorder/AddReorder";
import EditReorder from "../pages/dashboard/questions/reading/reorder/EditReorder";
import MultiSingle from "../pages/dashboard/questions/reading/multiPull-single/MultiSingle";
import AddMultipleSingle from "../pages/dashboard/questions/reading/multiPull-single/AddMulti";
import EditSingle from "../pages/dashboard/questions/reading/multiPull-single/EditMulti";
import Summarize_spoken from "../pages/dashboard/questions/Listening/summarize/Summarize_spoken";
import Add_Summarize from "../pages/dashboard/questions/Listening/summarize/Add_Summarize";
import Edit_Summarize from "../pages/dashboard/questions/Listening/summarize/Edit_Summarize";
import Multiple from "../pages/dashboard/questions/Listening/multipul_voice/Multipul";
import Add_multi from "../pages/dashboard/questions/Listening/multipul_voice/Add_multi";
import Edit_multi from "../pages/dashboard/questions/Listening/multipul_voice/Edit_multt";
import Multiple_single from "../pages/dashboard/questions/Listening/multipul_voice -single/Multipul_single";
import Fill_the_single from "../pages/dashboard/questions/Listening/fill_the_blanks/Multipul_single";
import Add_single_blanks from "../pages/dashboard/questions/Listening/fill_the_blanks/Add_single_blanks";
import Edit_single_blanks from "../pages/dashboard/questions/Listening/fill_the_blanks/Edit_single_blanks";
import AllMockTest from "../pages/dashboard/mock_test/all_mock_test/AllMockTest";
import AddMockTest from "../pages/dashboard/mock_test/all_mock_test/AddMockTest";
import AboutUs from "../pages/dashboard/Terms & Service/AboutUs";
import EditAbout from "../pages/dashboard/JodiEditor/EditAbout";
import SessionalMockHome from './../pages/dashboard/mock_test/sessional-mock/Sessional-Mock-Home';
import SpeakingMockTest from "../pages/dashboard/mock_test/sessional-mock/speaking/SpeakingMock";
import AddSectionalSpeakin from './../pages/dashboard/mock_test/sessional-mock/speaking/AddSectionalSpeakin';
import WrittingMockTest from './../pages/dashboard/mock_test/sessional-mock/Writing/WrittingMock';
import AddSectionalWritting from './../pages/dashboard/mock_test/sessional-mock/Writing/AddSectionalWritting';
import ReadingMock from './../pages/dashboard/mock_test/sessional-mock/Reading/ReadingMock';
import AddSectionalReading from './../pages/dashboard/mock_test/sessional-mock/Reading/AddSectionalReading';
import ListeningMockTest from './../pages/dashboard/mock_test/sessional-mock/Listening/ListeningMock';
import AddSectionalListening from './../pages/dashboard/mock_test/sessional-mock/Listening/AddSectionalListening';
import Privecy from "../pages/dashboard/Terms & Service/Privecy";

import EditPrivacy from "../pages/dashboard/JodiEditor/EditPrivacy";
import EditUser from './../pages/dashboard/users/EditUser';
import Templates from "../pages/dashboard/templates/Templates";
import Predictions from "../pages/dashboard/predictions/Predictions";
import HomeFaq from "../pages/dashboard/faq/HomeFaq";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <h1>dashboard error</h1>,
    children: [
      {
        path: "/",
        element: (
          <Admin>
            <DashboardHome />
          </Admin>
        ),
      },
      {
        path: "/users",
        element: (
          <Admin>
            <AllUsers />
          </Admin>
        ),
      },
      {
        path: "/users/edit/:id",
        element: (
          <Admin>
            <EditUser />
          </Admin>
        ),
      },
      {
        path: "/question",
        element: (
          <Admin>
            <AllQuestions />
          </Admin>
        ),
      },
      {
        path: "/question/read-aloud",
        element: (
          <Admin>
            <ReadAloud />
          </Admin>
        ),
      },
      {
        path: "/question/short-questions",
        element: (
          <Admin>
            <Short />
          </Admin>
        ),
      },
      {
        path: "/question/repeat-sentence",
        element: (
          <Admin>
            <RepeatSentence />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-reading",
        element: (
          <Admin>
            <Fill_in_the_Blanks />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-reading/add",
        element: (
          <Admin>
            <AddFill />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-single-reading/add",
        element: (
          <Admin>
            <AddMultipleSingle />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-single-reading/:id",
        element: (
          <Admin>
            <EditSingle />
          </Admin>
        ),
      },
      {
        path: "/question/summarize-spoken/:id",
        element: (
          <Admin>
            <Edit_Summarize />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-listening",
        element: (
          <Admin>
            <Multiple />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-listening/add",
        element: (
          <Admin>
            <Add_multi />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-listening/:id",
        element: (
          <Admin>
            <Edit_multi />
          </Admin>
        ),
      },
      {
        path: "/question/summarize-written",
        element: (
          <Admin>
            <SummarizeWritten />
          </Admin>
        ),
      },
      {
        path: "/mock/writing-tests",
        element: (
          <Admin>
            <WrittingMockTest />
          </Admin>
        ),
      },
      {
        path: "/mock/writing-tests/add",
        element: (
          <Admin>
            <AddSectionalWritting />
          </Admin>
        ),
      },
      {
        path: "/mock/reading-tests",
        element: (
          <Admin>
            <ReadingMock />
          </Admin>
        ),
      },
      {
        path: "/mock/listening-tests",
        element: (
          <Admin>
            <ListeningMockTest />
          </Admin>
        ),
      },
      {
        path: "/mock/listening-tests/add",
        element: (
          <Admin>
            <AddSectionalListening />
          </Admin>
        ),
      },
      {
        path: "/mock/reading-tests/add",
        element: (
          <Admin>
            <AddSectionalReading />
          </Admin>
        ),
      },
      {
        path: "/mock/speaking-tests/add",
        element: (
          <Admin>
            <AddSectionalSpeakin />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-listening",
        element: (
          <Admin>
            <Fill_the_single />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-listening/add",
        element: (
          <Admin>
            <Add_single_blanks />
          </Admin>
        ),
      },
      {
        path: "/mock-test/fill",
        element: (
          <Admin>
            <AllMockTest />
          </Admin>
        ),
      },
      {
        path: "/mock-test/sectional",
        element: (
          <Admin>
            <SessionalMockHome />
          </Admin>
        ),
      },
      {
        path: "/mock/speaking-tests",
        element: (
          <Admin>
            <SpeakingMockTest />
          </Admin>
        ),
      },
      {
        path: "/mock/full/add",
        element: (
          <Admin>
            <AddMockTest />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-listening/:id",
        element: (
          <Admin>
            <Edit_single_blanks />
          </Admin>
        ),
      },
      {
        path: "/question/summarize-spoken",
        element: (
          <Admin>
            <Summarize_spoken />
          </Admin>
        ),
      },
      {
        path: "/question/summarize-spoken/add",
        element: (
          <Admin>
            <Add_Summarize />
          </Admin>
        ),
      },
      {
        path: "/question/write-email",
        element: (
          <Admin>
            <EmailWrite />
          </Admin>
        ),
      },
      {
        path: "/question/read-aloud/:id",
        element: (
          <Admin>
            <Edit />
          </Admin>
        ),
      },
      {
        path: "/question/fill-blanks-reading/:id",
        element: (
          <Admin>
            <EditFill />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-reading/:id",
        element: (
          <Admin>
            <EditMulti />
          </Admin>
        ),
      },
      {
        path: "/question/reorder-paragraphs/:id",
        element: (
          <Admin>
            <EditReorder />
          </Admin>
        ),
      },
      {
        path: "/question/read-aloud/add",
        element: (
          <Admin>
            <Add />
          </Admin>
        ),
      },
      {
        path: "/question/response-situtation",
        element: (
          <Admin>
            <ResponseSitutation />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-reading",
        element: (
          <Admin>
            <Multi />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-single-reading",
        element: (
          <Admin>
            <MultiSingle />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-single-listening",
        element: (
          <Admin>
            <Multiple_single />
          </Admin>
        ),
      },
      {
        path: "/question/reorder-paragraphs",
        element: (
          <Admin>
            <Reorder />
          </Admin>
        ),
      },
      {
        path: "/question/reorder-paragraphs/add",
        element: (
          <Admin>
            <AddReorder />
          </Admin>
        ),
      },
      {
        path: "/question/multiple-choice-reading/add",
        element: (
          <Admin>
            <AddMultiple />
          </Admin>
        ),
      },
      {
        path: "/earning",
        element: (
          <Admin>
            <Earning />
          </Admin>
        ),
      },
      {
        path: "/subscription",
        element: (
          <Admin>
            <Subscription />
          </Admin>
        ),
      },
      {
        path: "/templates",
        element: (
          <Admin>
            <Templates />
          </Admin>
        ),
      },
      {
        path: "/predictions",
        element: (
          <Admin>
            <Predictions />
          </Admin>
        ),
      },
      {
        path: "/subscription/edit",
        element: (
          <Admin>
            <EditPricing />
          </Admin>
        ),
      },
      {
        path: "/faq",
        element: (
          <Admin>
            <Faq />
          </Admin>
        ),
      },
      {
        path: "/faq/home",
        element: (
          <Admin>
            <HomeFaq />
          </Admin>
        ),
      },
      {
        path: "settings",
        children: [
          {
            path: "profile",
            element: (
              <Admin>
                <PersonalInformation />
              </Admin>
            ),
          },
          {
            path: "terms",
            element: (
              <Admin>
                <Terms />
              </Admin>
            ),
          },
          {
            path: "privacy",
            element: (
              <Admin>
                <Privecy />
              </Admin>
            ),
          },
          {
            path: "about",
            element: (
              <Admin>
                <AboutUs />
              </Admin>
            ),
          },
          {
            path: "about/edit",
            element: (
              <Admin>
                <EditAbout />
              </Admin>
            ),
          },
          {
            path: "terms/edit",
            element: (
              <Admin>
                <Editor />
              </Admin>
            ),
          },
          {
            path: "privacy/edit",
            element: (
              <Admin>
                <EditPrivacy />
              </Admin>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/auth/admin",
    errorElement: <h1>auth error</h1>,
    children: [
      {
        path: "login",
        element: (
          <>
            <LogIn />
          </>
        ),
      },
      {
        path: "registration",
        element: (
          <Public>
            <SignIn />
          </Public>
        ),
      },
      {
        path: "recover-password",
        element: (
          <>
            <ForgetFrom />
          </>
        ),
      },
      {
        path: "recover-password/otp",
        element: (
          <>
            <VerifyOTP />
          </>
        ),
      },
      {
        path: "recover-password/set-password",
        element: (
          
            <SetPassword />
          
        ),
      },
    ],
  },
]);

export default router;
