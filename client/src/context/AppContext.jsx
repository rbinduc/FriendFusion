import { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import api from "../api";

export const AppContext = createContext();

export default function AppContextProvider({ children }) {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        console.log(res.data.data)
        setUsers(res.data.data);
      });
  }, []);

  console.log(children);

  return (
    <AppContext.Provider value={{ users, setUsers }}>
      {children}
    </AppContext.Provider>
  );
}

// AppContextProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };


// export const useAppContext = () => {
// const {users} = useContext(AppContext);

// return users;
// }

export const useAppContext = () => 

 useContext(AppContext);



// import PropTypes from "prop-types";

// export const Login = ({ firstName, lastName, email, password }) => {
//   console.log({ firstName, lastName, email, password });
//   return <div>Login</div>;
// };

// Login.propTypes = {
//   firstName: PropTypes.number.isRequired,
//   lastName: PropTypes.string.isRequired,
//   email: PropTypes.bool.isRequired,
//   password: PropTypes.string.isRequired,
// };