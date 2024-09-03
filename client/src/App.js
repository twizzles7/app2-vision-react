import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import WorkJournal from './pages/WorkJournal';
import Coach from './pages/Coach';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/journal" component={WorkJournal} />
        <Route path="/coach" component={Coach} />
      </Switch>
    </Router>
  );
}

export default App;