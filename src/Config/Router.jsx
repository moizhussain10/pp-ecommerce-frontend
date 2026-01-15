import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import Dashboard from "../Pages/UserDashboar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, auth } from "../Config/firebase";

function Router() {
  const [isuser, setisuser] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setisuser(!!user);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={isuser ? <Dashboard /> : <Signup />} />
        <Route path="/login" element={isuser ? <Dashboard /> : <Login />} />
        <Route>
          <Route path="/dashboard" element={<Dashboard logout={setisuser} />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default Router;
