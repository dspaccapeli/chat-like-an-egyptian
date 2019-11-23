//module imports
import React, { Component } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

//components imports
import Message from '../Message/Message'
import Home from '../Home/Home'

//style imports
import './App.css';

class App extends Component {
  //function accessible to all the components to display a message
  showToast = (type, message) => {
    // 0 = warning, 1 = success
    switch (type) {
      case 0:
        toast.warning(message);
        break;
      case 1:
        toast.success(message);
        break;
      default:
        break;
    }
  };

  render() {
    return (
        //manage all the pages inside the router
        <BrowserRouter>
          <div>
            {/*
              Toast is the notification handler/component
                autoClose, hide the notification in 2 seconds
                hideProgressBar, hide the countdown to hide
                position, where the notification should appear
            */}
            <ToastContainer
                autoClose={2000}
                hideProgressBar={true}
                position={toast.POSITION.BOTTOM_RIGHT}
            />
            {/*
              Deal with the switch between different _pages_
            */}
            <Switch>
              <Route
                  exact
                  path="/"
                  render={props => <Home showToast={this.showToast} {...props} />}
              />
              <Route
                  exact
                  path="/papyrus"
                  render={props => <Message showToast={this.showToast} {...props} />}
              />
            </Switch>
          </div>
        </BrowserRouter>
    )
  }
}

export default App;