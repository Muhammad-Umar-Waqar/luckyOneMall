// src/pages/Authentication/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../contexts/storecontexts";

const Logout = () => {
  const { LogoutTrue } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await LogoutTrue(true);
      navigate("/");
    })();
  }, []);

  return null;
};

export default Logout;
