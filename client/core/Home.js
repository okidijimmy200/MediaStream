import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import MediaList from '../media/MediaList'
import {listPopular} from '../media/api-media.js'

const useStyles = makeStyles(theme => ({
  card: {
    margin: `${theme.spacing(5)}px 30px`
  },
  title: {
    padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px 0px`,
    color: theme.palette.text.secondary,
    fontSize: '1em'
  },
  media: {
    minHeight: 330
  }
}))

export default function Home(){
  const classes = useStyles()
  const [media, setMedia] = useState([])

  useEffect(() => {
    /**listpopular the fetch method can be called in a React component,
such as in the Home component for this application */
    const abortController = new AbortController()
    const signal = abortController.signal
    listPopular(signal).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        /**The list that's fetched from the API in this hook is set in the state so that it can be
passed to a MediaList component in the view. */
        setMedia(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [])
  return (
      <Card className={classes.card}>
        <Typography variant="h2" className={classes.title}>
          Popular Videos
        </Typography>
        {/* This will render a list of up to nine of the most popular videos from the database on
the home page */}
          <MediaList media={media}/>
      </Card>
  )
}
