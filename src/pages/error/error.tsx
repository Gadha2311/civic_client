import React from "react";
import "./error.css"; 

const NotFound: React.FC = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-text">
        Oops! Sembra che tu sia perso nel buio...{" "}
        <span className="animate-blink">????</span>
      </p>
    </div>
  );
};

export default NotFound;
