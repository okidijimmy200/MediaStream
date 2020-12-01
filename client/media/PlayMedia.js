import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import {read, listRelated} from './api-media.js'
import Media from './Media'
import RelatedMedia from './RelatedMedia'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  toggle: {
    float: 'right',
    marginRight: '30px',
    marginTop:' 10px'
  }
}))

/**The PlayMedia component will render the play media page. This component consists of the Media and RelatedMedia child components along with an autoplay toggle,
and it provides data to these components when it loads in the view. */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**In the parent component will fetch the media from the server in a useEffect
hook, set it to state, and add it to the Media component */
export default function PlayMedia(props) {
  const classes = useStyles()
  let [media, setMedia] = useState({postedBy: {}})
  let [relatedMedia, setRelatedMedia] = useState([])
  const [autoPlay, setAutoPlay] = useState(false)

  /**we will add the Media component in a PlayMedia
component that fetches the media content from the server in a useEffect hook using
the read API and passes it to Media as a prop. */

  useEffect(() => {
    /**useEffect hook, it will fetch the media to be loaded in the media player */
    const abortController = new AbortController()
    const signal = abortController.signal
/**The media ID from the route path is accessed in the props.match received from the
React Router components. It is used in the call to the read API fetch method to
retrieve the media details from the server. */
    read({mediaId: props.match.params.mediaId}, signal).then((data) => {
      if (data && data.error) {
        console.log(data.error)
      } else {
        /**The received media object is set in the state so that it can be rendered in the Media component. */
        setMedia(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [props.match.params.mediaId])

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    listRelated({
      /**useEffect hook, we use the same media ID to call the listRelated API
fetch method */
      mediaId: props.match.params.mediaId}, signal).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        /**The listRelated API fetch method retrieves the related media list from the server
and sets the values to the state so that it can be rendered in the RelatedMedia
component */
        setRelatedMedia(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [props.match.params.mediaId])

  const handleChange = (event) => {
   setAutoPlay(event.target.checked)
  }
  const handleAutoplay = (updateMediaControls) => {
    let playList = relatedMedia
    let playMedia = playList[0]
    if(!autoPlay || playList.length == 0 )
      return updateMediaControls()
   
    if(playList.length > 1){
      playList.shift()
      setMedia(playMedia)
      setRelatedMedia(playList)
    }else{
      listRelated({
          mediaId: playMedia._id}).then((data) => {
            if (data.error) {
             console.log(data.error)
            } else {
              setMedia(playMedia)
              setRelatedMedia(data)
            }
         })
    }
  }
  //render SSR data
    if (props.data && props.data[0] != null) {
          media = props.data[0]
          relatedMedia = []
    }
/**We will also discuss the implementation of
the handleAutoPlay method that will be passed as a prop to the Media component.
It will also receive the media detail object, and the video URL for the first item in the
related media list, which will be treated as the next URL to play */
    const nextUrl = relatedMedia.length > 0
          ? `/media/${relatedMedia[0]._id}` : ''
    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
        {/* In the play media page, beside the media loaded in the player, we will load a list of
related media in the RelatedMedia component. The RelatedMedia component will
take the list of related media as a prop from the PlayMedia component and render
the details along with a video snapshot of each video in the list, */}
          <Grid item xs={8} sm={8}>
{/* Media component renders the media details on the play media page, and also a
customized media player that allows viewers to control the streaming of the video. */}
            <Media media={media} nextUrl={nextUrl} handleAutoplay={handleAutoplay}/>
          </Grid>
          {/* To render this RelatedMedia component in the play media page, we have to add it to the PlayMedia component. The PlayMedia component will use the related media
list API implemented earlier in this section to retrieve the related media from the backend, and then pass it in the props to the RelatedMedia component. */}
          {relatedMedia.length > 0
          /**The media and related media list values stored in the state are used to pass relevant
props to these child components that are added in the view */
            && (<Grid item xs={4} sm={4}>
                    <FormControlLabel className = {classes.toggle}
                        control={
                          <Switch
                            checked={autoPlay}
                            onChange={handleChange}
                            color="primary"
                          />
                        }
                        label={autoPlay ? 'Autoplay ON':'Autoplay OFF'}
                    />
                  <RelatedMedia media={relatedMedia}/>
                </Grid>)
           }
        </Grid>
      </div>)
  }

