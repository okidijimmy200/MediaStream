import React from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import {Link} from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import ReactPlayer from 'react-player'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    paddingBottom: 24,
    backgroundColor: '#80808024'
  }),
  title: {
    margin: `${theme.spacing(3)}px ${theme.spacing(1)}px ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    fontSize: '1em'
  },
  card: {
    width: '100%',
    display: 'inline-flex'
  },
  details: {
    display: 'inline-block',
    width: "100%"
  },
  content: {
    flex: '1 0 auto',
    padding: '16px 8px 0px'
  },
  controls: {
    marginTop: '8px'
  },
  date: {
    color: 'rgba(0, 0, 0, 0.4)'
  },
  mediaTitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '130px',
    fontSize: '1em',
    marginBottom: '5px'
  },
  subheading: {
    color: 'rgba(88, 114, 128, 0.67)'
  },
  views: {
    display: 'inline',
    lineHeight: '3',
    paddingLeft: '8px',
    color: theme.palette.text.secondary
  }
}))
export default function RelatedMedia(props) {
  const classes = useStyles()
    return (
      <Paper className={classes.root} elevation={4} style={{padding: '16px'}}>
          <Typography type="title" className={classes.title}>
            Up Next
          </Typography>
          {/* In the implementation of the RelatedMedia view, we iterate through the media array received in the props using the map function and render each media item's
details and video snapshot */}
          {props.media.map((item, i) => {
              return <span key={i}><Card className={classes.card} >
                <div style={{marginRight: "5px", backgroundColor: "black"}}>
                  {/* We wrap the ReactPlayer with a link to the individual view of this media. So,clicking on the given video snapshot will re-render the PlayMedia view to load the
linked media's details */}
              <Link to={"/media/"+item._id}>
                {/* to render the video snapshot for each media item, we will use a basic ReactPlayer without the controls */}
                <ReactPlayer url={'/api/media/video/'+item._id} width='160px' height='140px'/></Link>
              </div>
              {/* Beside the snapshot, we will display the details of each video including title, genre, created date, and the number of views, */}
                      <div className={classes.details}>
                        {/* This will render the details next to the video snapshot for each media in the related
media list that is received in the props */}
                        <CardContent className={classes.content}>
                          <Link to={'/media/'+item._id}><Typography type="title" component="h3" className={classes.mediaTitle} color="primary">{item.title}</Typography></Link>
                          <Typography type="subheading" className={classes.subheading}>
                            {item.genre}
                          </Typography>

                          <Typography component="p" className={classes.date}>
                            {(new Date(item.created)).toDateString()}
                          </Typography>

                        </CardContent>
                        <div className={classes.controls}>
                        <Typography type="subheading" component="h3" className={classes.views} color="primary"> {item.views} views</Typography>
                        </div>
                      </div>

                    </Card>
                    <Divider/>
                    </span>
            })
          }
      </Paper>
    )
  }

RelatedMedia.propTypes = {
  media: PropTypes.array.isRequired
}