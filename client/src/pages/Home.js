import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to AI Career Coach</h1>
      <Link to="/journal">
        <button>Work Journal</button>
      </Link>
      <Link to="/coach">
        <button>Coach</button>
      </Link>
    </div>
  );
}

export default Home;