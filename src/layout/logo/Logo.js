import React from "react";
import iDoks from "../../images/iDoks.png";
// import LogoDark2x from "../../images/logo-dark2x.png";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    // <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
    //   <img className="logo-light logo-img" src={{}} alt="iDoks" />
    //   <img className="logo-dark logo-img" src={{}} alt="iDoks" />
    // </Link>

    <Link to={`${process.env.PUBLIC_URL}/home`}>
      {/* <h1 style={{ fontSize: "1.4rem", color: "white", fontWeight: "bold" }}>iDoks</h1> */}
      <img className="logo-light logo-img" src={iDoks} alt="iDoks" style={{ width: "5rem" }} />
    </Link>
  );
};

export default Logo;
