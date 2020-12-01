import React, {useState, useEffect, useRef} from 'react'
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
  
  useEffect(() => {
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

  const changeVolume = e => {
    setVolume(parseFloat(e.target.value))
  }
  const toggleMuted = () => {
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
  const onProgress = progress => {
    // We only want to update time slider if we are not currently seeking
    if (!seeking) {
      setValues({...values, played:progress.played, loaded: progress.loaded})
    }
  }
  const onClickFullscreen = () => {
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
  const onDuration = (duration) => {
    setDuration(duration)
  }
  const onSeekMouseDown = e => {
    setSeeking(true)
  }
  const onSeekChange = e => {
    setValues({...values, played:parseFloat(e.target.value), ended: parseFloat(e.target.value) >= 1})
  }
  const onSeekMouseUp = e => {
    setSeeking(false)
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
  const format = (seconds) => {
    const date = new Date(seconds * 1000)
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
        <LinearProgress color="primary" variant="buffer" value={values.played*100} valueBuffer={values.loaded*100} style={{width: '100%'}} classes={{
              colorPrimary: classes.primaryColor,
              dashedColorPrimary : classes.primaryDashed,
              dashed: classes.dashed
        }}/>
        <input type="range" min={0} max={1}
                value={values.played} step='any'
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
          <Icon>{volume > 0 && !muted && 'volume_up' || muted && 'volume_off' || volume==0 && 'volume_mute'}</Icon>
        </IconButton>
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
        <IconButton color="primary" onClick={onClickFullscreen}>
          <Icon>fullscreen</Icon>
        </IconButton>
        <span style={{float: 'right', padding: '10px', color: '#b83423'}}>
          <time dateTime={`P${Math.round(duration * values.played)}S`}>
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
