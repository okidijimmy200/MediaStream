import React, {useState, useEffect, useRef} from 'react'
// import screenfull and findDOMNode into the MediaPlayer
import { findDOMNode } from 'react-dom'
import screenfull from 'screenfull'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import ReactPlayer from 'react-player'
import LinearProgress from '@material-ui/core/LinearProgress'

const useStyles = makeStyles(theme => ({
  flex:{
    display:'flex'
  },
  primaryDashed: {
    background: 'none',
    backgroundColor: theme.palette.secondary.main
  },
  primaryColor: {
    backgroundColor: '#6969694f'
  },
  dashed: {
    animation: 'none'
  },
  controls:{
    position: 'relative',
    backgroundColor: '#ababab52'
  },
  rangeRoot: {
    position: 'absolute',
    width: '100%',
    top: '-7px',
    zIndex: '3456',
    '-webkit-appearance': 'none',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  videoError: {
    width: '100%',
    textAlign: 'center',
    color: theme.palette.primary.light
  }
}))

export default function MediaPlayer(props) {
  // set the initial control values of MediaPlayer in the component's state
  const classes = useStyles()
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)      
  const [muted, setMuted] = useState(false)     
  const [duration, setDuration] = useState(0)  
  const [seeking, setSeeking] = useState(false)    
  const [playbackRate, setPlaybackRate] = useState(1.0)     
  const [loop, setLoop] = useState(false)      
  const [fullscreen, setFullscreen] = useState(false)
  const [videoError, setVideoError] = useState(false) 
  let playerRef = useRef(null)
  const [values, setValues] = useState({
    played: 0, loaded: 0, ended: false
    /**These values set in the state will allow us to customize the functionalities of the
corresponding controls in the ReactPlayer component */
  })
  
  /*we will use a useEffect hook to add a screenfull change event listener that will update the fullscreen value in the state
to indicate whether the screen is in fullscreen or not. */
  useEffect(() => {
    /*This fullscreen value set in the state will be updated when the user interacts with the button for rendering the video in fullscreen mode */
    if (screenfull.enabled) {
      screenfull.on('change', () => {
        let fullscreen = screenfull.isFullscreen ? true : false
        setFullscreen(fullscreen)
      })
    }
  }, [])
  /**As we will allow users to play another video in the player from the related media list, we will reset the error
message if a new video is loaded. We can hide the error message when a new video
loads with a useEffect hook, by ensuring the useEffect only runs when the video
source URL changes */
  useEffect(() => {
    setVideoError(false)
    /**This will ensure the error message isn't shown when a new video is loaded and
streaming correctly */
  }, [props.srcUrl])

  /**Changing the on the input range will set the value in the state value volume accordingly by invoking the method. changeVolume */
  const changeVolume = e => {
    // The volume value changed in the state will be applied to the ReactPlayer, and this will set the volume of the current media being played.
    setVolume(parseFloat(e.target.value))
  }
  /**When this IconButton is clicked, it will either mute or unmute the volume by invoking the toggleMuted method */
  const toggleMuted = () => {
    //The volume will be muted or unmuted, depending on the current value of muted in the state
    setMuted(!muted)
  }
  /**When the user clicks the button, we will update the playing value in the state, so
the ReactPlayer is also updated. We achieve this by invoking the playPause
method when this button is clicked */
  const playPause = () => {
    /**The updated value of playing in the state will play or pause the video in the
ReactPlayer component accordingly */
    setPlaying(!playing)
  }
  /**The loop icon color will change based on the value of loop in the state. When this
loop icon button is clicked, we will update the loop value in the state by invoking the
onLoop method */
  const onLoop = () => {
    //The video will play on loop when this loop value is set to true
    setLoop(!loop)
  }
  /**To update the LinearProgress component when the video is playing or loading, we will use the onProgress event listener to set the current values for played and
loaded */
  const onProgress = progress => {
    // We only want to update time slider if we are not currently seeking so we first check the seeking value in the state before setting the played and loaded values.
    if (!seeking) {
      setValues({...values, played:progress.played, loaded: progress.loaded})
    }
  }
  /* When the user clicks this button, we will use screenfull and findDOMNode to make the video player fullscreen by invoking the onClickFullscreen method */
  const onClickFullscreen = () => {
    /*We access the element that renders the media player in the browser by using the playerRef reference in findDOMNode and make it fullscreen by using
screenfull.request. The user can then watch the video in fullscreen, where they can press Esc at any time to exit fullscreen and get back to the PlayMedia view */
   screenfull.request(findDOMNode(playerRef))
  }
  /**We will need to catch the onEnded event, to check whether loop has been set to true, so the playing
value can be updated accordingly. When a video reaches the end, the onEnded method will be invoked. */
  const onEnded = () => {
    /**if the loop value is set to true, when the video ends it will start playing again;
otherwise, it will stop playing and render the replay button. */
    if(loop){
      setPlaying(true)
    } else{
      props.handleAutoplay(()=>{
        setValues({...values, ended:true}) 
        setPlaying(false)
      })
    }
  }
  /*We will get this total duration value for a video by using the onDuration event and then set
it to the state, so it can be rendered in the time element. */
  const onDuration = (duration) => {
    setDuration(duration)
  }
  /*When the user starts dragging by holding the mouse down, we will set seeking to
true so that the progress values are not set in played and loaded */
  const onSeekMouseDown = e => {
    setSeeking(true)
  }
  /*As the range value change occurs, we will invoke the onSeekChange method to set the played value and also the ended value, after checking whether the user dragged
the time slider to the end of the video */
  const onSeekChange = e => {
    setValues({...values, played:parseFloat(e.target.value), ended: parseFloat(e.target.value) >= 1})
  }
  /*When the user is done dragging and lifts their click on the mouse, we will set seeking to false, and set the seekTo value for the media player to the current
value set in the input range. */
  const onSeekMouseUp = e => {
    setSeeking(false)
    /*This way, the user will be able to select any part of the video to play from, and also get visual information on the time progress of the video being streamed. */
    playerRef.seekTo(parseFloat(e.target.value))
  }
  /**We will use the useRef React hook to initialize the reference
to null and then set it to the corresponding player element using the ref method */
  const ref = player => {
    /**The value in playerRef will give access to the player element rendered in the
browser. We will use this reference to manipulate the player as required, to make the
custom controls functional */
      playerRef = player
  }
  /*To make the duration and already played time values readable, */
  const format = (seconds) => {
    const date = new Date(seconds * 1000)
    /*format function takes the duration value in seconds and converts it to the hh/mm/ss format, using methods from the JavaScript Date API. */
    const hh = date.getUTCHours()
    let mm = date.getUTCMinutes()
    const ss = ('0' + date.getUTCSeconds()).slice(-2)
    if (hh) {
      mm = ('0' + date.getUTCMinutes()).slice(-2)
      return `${hh}:${mm}:${ss}`
    }
    return `${mm}:${ss}`
  }
  /**As a final step for initializing the media player, we will add code for handling errors
thrown by the player if the specified video source cannot be loaded for any reason */
  const showVideoError = e => {
    //This method will render an error message in the view above the media player.
    console.log(e)
    setVideoError(true)
  }

  return (<div>
    {/* We
can show this error message conditionally by adding the following code in the view
above the ReactPlayer: */}
    {videoError && <p className={classes.videoError}>Video Error. Try again later.</p>}
      <div className={classes.flex}>
        
{/* we will add this ReactPlayer with these control values and source URL, using the prop sent from the Media component */}
        <ReactPlayer
        /**We also need to get a reference to this player
element rendered in the browser so that it can be used in the change-handling code
for the custom controls. */
          ref={ref}
            width={fullscreen ? '100%':'inherit'}
            height={fullscreen ? '100%':'inherit'}
            /**Besides setting the control values, we will also add styling to the player, depending
on whether it is in fullscreen mode. */
            style={fullscreen ? {position:'relative'} : {maxHeight: '500px'}}
            config={{ attributes: { style: { height: '100%', width: '100%'} } }}
            url={props.srcUrl}
            playing={playing}
            loop={loop}
            playbackRate={playbackRate}
            volume={volume}
            muted={muted}
            onEnded={onEnded}
            onError={showVideoError}
            onProgress={onProgress}
            onDuration={onDuration}/>
          <br/>
      </div>
      <div className={classes.controls}>
        {/* The LinearProgress component will use the played and loaded values in the state to render these bars. It will take the played and loaded values to show each in a
different color */}
        <LinearProgress color="primary" variant="buffer" value={values.played*100} valueBuffer={values.loaded*100} style={{width: '100%'}} classes={{
              colorPrimary: classes.primaryColor,
              dashedColorPrimary : classes.primaryDashed,
              dashed: classes.dashed
        }}/>

       {/* For time-sliding control, we will add the range input element and define styles to place it over the LinearProgress component.
The current value of the range will update as the played value changes, so the range value seems to be moving with the progression of the video.  */}
        <input type="range" min={0} max={1}
                value={values.played} step='any'
                /**In the case where the user drags and sets the range picker on their own, we will add
code to handle the onMouseDown, onMouseUp, and onChange events to start the
video from the desired position */
                onMouseDown={onSeekMouseDown}
                onChange={onSeekChange}
                onMouseUp={onSeekMouseUp}
                className={classes.rangeRoot}/>
{/* To implement the play, pause, and replay functionality, we will add a play, pause, or
replay icon button conditionally depending on whether the video is playing, is
paused, or has ended, */}
        <IconButton color="primary" onClick={playPause}>
          <Icon>{playing ? 'pause': (values.ended ? 'replay' : 'play_arrow')}</Icon>
        </IconButton>
        {/* The play next button will be disabled if the related list does not contain any media. */}
        <IconButton disabled={!props.nextUrl} color="primary">
          {/* The play next icon will basically link to the next URL value passed in as a prop from
PlayMedia */}
{/* Clicking on this play next button will reload the PlayMedia component with the new
media details and start playing the video. */}
          <Link to={props.nextUrl} style={{color: 'inherit'}}>
            <Icon>skip_next</Icon>
          </Link>
        </IconButton>
        <IconButton color="primary" onClick={toggleMuted}>
          {/* we will conditionally render the different icons in an IconButton, based on the volume, muted, volume_up, and volume_off values */}
          {/* When this IconButton is clicked, it will either mute or unmute the volume by
invoking the toggleMuted method */}
          <Icon>{volume > 0 && !muted && 'volume_up' || muted && 'volume_off' || volume==0 && 'volume_mute'}</Icon>
        </IconButton>
         {/* To allow users to increase or decrease the volume, we will add an input element of type range that will allow users to set a volume value between 0 and 1. */}
         {/* ------------------------------------------------------------- */}
{/*  Changing the value on the input range will set the volume value in the state accordingly by invoking the changeVolume method. */} 
        <input type="range" min={0} max={1} step='any' value={muted? 0 : volume} onChange={changeVolume} style={{verticalAlign: 'middle'}}/>
        
        
        
        {/*Users will be able to set the current video to keep playing in a loop, using a loop
button. The loop button will render in two states, set and unset.
        This loop icon button will display in a different color to indicate whether it has been
set or unset by the user */}
        <IconButton color={loop? 'primary' : 'default'} onClick={onLoop}>
          {/* The loop icon color will change based on the value of loop in the state. When this
loop icon button is clicked, we will update the loop value in the state by invoking the
onLoop method */}
          <Icon>loop</Icon>
        </IconButton>
        {/* we will add an icon button for fullscreen with the other control buttons, */}
        <IconButton color="primary" onClick={onClickFullscreen}>
          <Icon>fullscreen</Icon>
        </IconButton>
        <span style={{float: 'right', padding: '10px', color: '#b83423'}}>
          {/* To show the time, we can utilize the HTML time element, which takes a datetime
value, and add it to the view code in MediaPlayer, */}
          <time dateTime={`P${Math.round(duration * values.played)}S`}>
            {/* we provide the total rounded-off
seconds that represent the played duration or the total duration of the video. */}
            {format(duration * values.played)}
          </time> / <time dateTime={`P${Math.round(duration)}S`}>
                        {format(duration)}
                    </time>
        </span>
      </div>
    </div>
  )
}

MediaPlayer.propTypes = {
  srcUrl: PropTypes.string,
  nextUrl: PropTypes.string,
  handleAutoplay: PropTypes.func.isRequired
}
