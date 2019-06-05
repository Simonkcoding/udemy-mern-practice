import React, { Fragment } from 'react';
import './App.css';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


const App = () =>
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path='/' component={Landing} />
    </Fragment>
  </Router>

export default App;
