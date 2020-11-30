import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import Edit from '@material-ui/icons/Edit'
import Avatar from '@material-ui/core/Avatar'
import auth from './../auth/auth-helper'
import {Link} from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import DeleteMedia from './DeleteMedia'
import MediaPlayer from './MediaPlayer'

const useStyles = makeStyles(theme => ({
  card: {
    padding:'20px'
  },
  header: {
    padding:'0px 16px 16px 12px'
  },
  action: {
    margin: '24px 20px 0px 0px',
    display: 'inline-block',
    fontSize: '1.15em',
    color: theme.palette.secondary.dark
  },
  avatar: {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light
  }
}))

export default function Media(props) {
  const classes = useStyles()
  /**we will also load the video in the Media
component. The video URL, which is basically the get video API route we set up in
the backend, is loaded in a ReactPlayer with default browser controls */
  const mediaUrl = props.media._id
        ? `/api/media/video/${props.media._id}`
        : null
  const nextUrl = props.nextUrl
  return (
    <Card className={classes.card}>
      {/* The Media component will take this data in the props and render it in the view to
display the details and load the video in a ReactPlayer component. The title, genre,
and view count details of the media can be rendered in a Material-UI CardHeader
component in the Media component */}
      <CardHeader className={classes.header}
            title={props.media.title}
            action={
              <span className={classes.action}>{props.media.views + ' views'}</span>
            }
            subheader={props.media.genre}
      />
      <MediaPlayer srcUrl={mediaUrl} nextUrl={nextUrl} handleAutoplay={props.handleAutoplay}/>
      <List dense>
        {/* The Media component also renders additional details about the user who posted the
video, a description of the video, and the date it was created */}
        <ListItem>
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              {props.media.postedBy.name && props.media.postedBy.name[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={props.media.postedBy.name}
                        secondary={"Published on " + (new Date(props.media.created)).toDateString()}/>
                        {/* we will also
conditionally show edit and delete options if the currently signed-in user is the one
who posted the media being displayed */}
          { auth.isAuthenticated().user
              && auth.isAuthenticated().user._id == props.media.postedBy._id
              /**This will ensure that the edit and delete options only render when the current user is
signed in and is the uploader of the media being displayed */
              && (<ListItemSecondaryAction>
                    <Link to={"/media/edit/" + props.media._id}>
                      <IconButton aria-label="Edit" color="secondary">
                        {/* The edit option links to
the media edit form, while the delete option opens a dialog box that can initiate the
deletion of this particular media document from the database. */}
                        <Edit/>
                      </IconButton>
                    </Link>
                    <DeleteMedia mediaId={props.media._id} mediaTitle={props.media.title}/>
                  </ListItemSecondaryAction>)
          }
        </ListItem>
        <Divider/>
        <ListItem>
          <ListItemText primary={props.media.description}/>
        </ListItem>
      </List>
    </Card>)
}


Media.propTypes = {
  media: PropTypes.object,
  nextUrl: PropTypes.string,
  handleAutoplay: PropTypes.func.isRequired
}

