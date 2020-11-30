import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'
import Home from './core/Home'
import Users from './user/Users'
import Signup from './user/Signup'
import Signin from './auth/Signin'
import EditProfile from './user/EditProfile'
import Profile from './user/Profile'
import PrivateRoute from './auth/PrivateRoute'
import Menu from './core/Menu'
import NewMedia from './media/NewMedia'
import PlayMedia from './media/PlayMedia'
import EditMedia from './media/EditMedia'

const MainRouter = ({data}) => {
  return (<div>
      <Menu/>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/users" component={Users}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/signin" component={Signin}/>
        <PrivateRoute path="/user/edit/:userId" component={EditProfile}/>
        <Route path="/user/:userId" component={Profile}/>

      {/* The NewMedia component can only be viewed by a signed-in user. Therefore, we will
add a PrivateRoute in the MainRouter component, which will render this form
only for authenticated users at /media/new */}
        <PrivateRoute path="/media/new" component={NewMedia}/>
        {/* This EditMedia component can only be accessed by signed-in users and will be
rendered at '/media/edit/:mediaId'. Due to this, we will add a PrivateRoute in
the MainRouter component */}
        <PrivateRoute path="/media/edit/:mediaId" component={EditMedia}/>
        <Route path="/media/:mediaId" render={(props) => (
            <PlayMedia {...props} data={data} />
        )} />
      </Switch>
    </div>)
}

export default MainRouter
