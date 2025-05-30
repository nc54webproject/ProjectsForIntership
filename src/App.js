import "./App.css";
import CreateAccount from "./pages/CreateAccount";
import GettingStarded from "./pages/GettingStarded";
import Dashbaord from "./pages/Dashbaord";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute, GuestRoute } from "./ProtectedRoute";
// import NodeFlowEdit from "./pages/NodeFlowEdit";
import NodeFlowEditor from "./pages/NodeFlowEditor";


function App() {
  return (
    <>
      <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <GettingStarded />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <CreateAccount />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashbaord />
              </ProtectedRoute>
            }
          />
           <Route
            path="/webchat/:id"
            element={
              <ProtectedRoute>
                <NodeFlowEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  );
}

export default App;
