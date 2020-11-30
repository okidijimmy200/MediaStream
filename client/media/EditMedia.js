import React, {useState, useEffect} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import auth from './../auth/auth-helper'
import {read, update} from './api-media.js'
import {Redirect} from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 500,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle,
    fontSize: '1em'
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  },
  input: {
  display: 'none'
},
filename:{
  marginLeft:'10px'
}
}))

/**The media edit form, which will allow an authorized user to make changes to the
details of a media post, will be similar to the new media form. However, it will not
have an upload option, and the fields will be pre-populated with the existing value */
export default function EditProfile({ match }) {
  const classes = useStyles()
  const [media, setMedia] = useState({title: '', description:'', genre:''})
  const [redirect, setRedirect] = useState(false)
  const [error, setError] = useState('')
  const jwt = auth.isAuthenticated()

  /**The EditMedia component containing this form will fetch the existing values of the
media by calling the read media API in a useEffect hook */
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    read({mediaId: match.params.mediaId}).then((data) => {
      if (data.error) {
        setError(data.error)
      } else {
        //The retrieved media details are set to state so that the values can be rendered in the text fields
        setMedia(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [match.params.mediaId])

  /**When the user is done editing and clicks submit, a call will be made to the update API with the required credentials
and the changed media values. */
  const clickSubmit = () => {
    const jwt = auth.isAuthenticated()
    /**The call to the update media API will update the media details in the corresponding
media document in the Media collection, while the video file associated with the
media remains as it is in the database. */
    update({
      mediaId: media._id
    }, {
      t: jwt.token
    }, media).then((data) => {
      if (data.error) {
        setError(data.error)
      } else {
        setRedirect(true)
      }
    })
  }

  /**When a user updates any of the values in the form, the changes will be registered in
the media object in state with a call to the handleChange method. */

  const handleChange = name => event => {
    let updatedMedia = {...media}
    /**the specific field that's being updated in the form is reflected in the
corresponding attribute in the media object in state. */
    updatedMedia[name] = event.target.value
    setMedia(updatedMedia)
  }
    if (redirect) {
      return (<Redirect to={'/media/' + media._id}/>)
    }
    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h1" className={classes.title}>
            Edit Video Details
          </Typography>
          <TextField id="title" label="Title" className={classes.textField} value={media.title} onChange={handleChange('title')} margin="normal"/><br/>
          <TextField
            id="multiline-flexible"
            label="Description"
            multiline
            rows="2"
            value={media.description}
            onChange={handleChange('description')}
            className={classes.textField}
            margin="normal"
          /><br/>
          <TextField id="genre" label="Genre" className={classes.textField} value={media.genre} onChange={handleChange('genre')} margin="normal"/><br/>
          <br/> {
                  error &&
                  (<Typography component="p" color="error">
                    <Icon color="error" className={classes.error}>error</Icon>
                    {error}
                  </Typography>)
                }
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
        </CardActions>
      </Card>
    )
  }
