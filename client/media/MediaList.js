import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import GridListTile from '@material-ui/core/GridListTile'
import {Link} from 'react-router-dom'
import ReactPlayer from 'react-player'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    background: theme.palette.background.paper,
    textAlign: 'left',
    padding: '8px 16px'
  },
  gridList: {
    width: '100%',
    minHeight: 180,
    padding: '0px 0 10px'
  },
  title: {
    padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    width: '100%'
  },
  tile: {
    textAlign: 'center',
    maxHeight: '100%'
  },
  tileBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    textAlign: 'left',
    height: '55px'
  },
  tileTitle: {
    fontSize:'1.1em',
    marginBottom:'5px',
    color:'rgb(193, 173, 144)',
    display:"block"
  },
  tileGenre: {
    float: 'right',
    color:'rgb(193, 182, 164)',
    marginRight: '8px'
  }
}))

export default function MediaList(props) { 
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {/* The MediaList component is a reusable component that will take a list of media and
iterate through it to render each media item in the view. In MERN Mediastream, we
use it to render a list of the most popular media in the home view and a list of media
uploaded by a specific user in their profile */}
      <GridList className={classes.gridList} cols={3}>
        {props.media.map((tile, i) => (
          <GridListTile key={i} className={classes.tile}>
            <Link to={"/media/"+tile._id}>
              {/* ReactPlayer component, which renders the video URL
without showing any controls. In the view, this gives the visitor a brief overview of
each piece of media, as well as a glimpse of the video content. */}
              <ReactPlayer url={'/api/media/video/'+tile._id} width='100%' height='inherit' style={{maxHeight: '100%'}}/>
            </Link>
            <GridListTileBar className={classes.tileBar}
              title={<Link to={"/media/"+tile._id} className={classes.tileTitle}> {tile.title} </Link>}
              subtitle={<span>
                          <span>{tile.views} views</span>
                          <span className={classes.tileGenre}>
                            <em>{tile.genre}</em>
                          </span>
                        </span>}
            />
          </GridListTile>
        ))}
      </GridList>
    </div>)
}

MediaList.propTypes = {
  media: PropTypes.array.isRequired
}

