import Media from '../models/media.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'

//media streaming
/**Since we are using Mongoose to establish a connection with the MongoDB database for our application, we will add the following code to initialize a new GridFSBucket
with this database connection after it has been established. */
import mongoose from 'mongoose'
let gridfs = null
/**The gridfs object we created here will give us access to the GridFS functionalities that are required to store the video file when new media is created and to fetch the
file when the media is to be streamed back to the user. */
mongoose.connection.on('connected', () => {
  gridfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db)
})

const create = (req, res) => {
  /**The create controller method will use the formidable node module to parse the
multipart request body that will contain the media details and video file uploaded by
the user. */
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Video could not be uploaded"
        })
      }
            /**In the create method, we will use the media fields that have been received in the
form data and parsed with formidable to generate a new Media object and then
save it to the database */
      let media = new Media(fields)
      media.postedBy= req.profile
      if(files.video){
  /**If there is a file in the request, formidable will store it temporarily in the filesystem.
We will use this temporary file and the media object's ID to create a writable stream
with gridfs.openUploadStream. Here, the temporary file will be read and then
written into MongoDB GridFS, while setting the filename value to the media ID. */
        let writestream = gridfs.openUploadStream(media._id, {
          contentType: files.video.type || 'binary/octet-stream'})
          /**This will generate the associated chunks and file information documents in
MongoDB, and when it is time to retrieve this file, we will identify it with the media
ID. */
        fs.createReadStream(files.video.path).pipe(writestream)
      }
      try {
        let result = await media.save()
        res.status(200).json(result)
      }
      catch (err){
          return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
          })
      }
    })
}

/**The :mediaId parameter in the route URL will be processed in the mediaByID controller to fetch the associated document from the Media collection and file details
from GridFS */
const mediaByID = async (req, res, next, id) => {
  try{
    /**To retrieve the relevant file details from GridFS, we use find from the MongoDB streaming API. We query the files stored in GridFS by the filename value, which
should match the corresponding media ID in the Media collection */
  let media = await Media.findById(id).populate('postedBy', '_id name').exec()
    if (!media)
      return res.status('400').json({
        error: "Media not found"
      })
      req.media = media
     /**Then, we receive the resulting matching file records in an array and attach the first result to the request
object so that it can be used in the next method. */
      let files = await gridfs.find({filename:media._id}).toArray()
        if (!files[0]) {
          return res.status(404).send({
            error: 'No video found'
          })
        }     
         /**These retrieved results are then attached to the request object so that it can be used in the video controller method as required. */
        req.file = files[0]
        /**The next method that's invoked when this API receives a request is the video
controller method */
        next()
    }catch(err) {
      return res.status(404).send({
        error: 'Could not retrieve media file'
      })
    }
}

/**video controller depending on whether the request contains range headers, we send back the correct chunks of video with the related content
information set as response headers. */
const video = (req, res) => {
  /**with the response composed depending on the existence of range
headers in the request. */
  const range = req.headers["range"]
  if (range && typeof range === "string") {
    const parts = range.replace(/bytes=/, "").split("-")
    const partialstart = parts[0]
    const partialend = parts[1]

    const start = parseInt(partialstart, 10)
    const end = partialend ? parseInt(partialend, 10) : req.file.length - 1
    const chunksize = (end - start) + 1

    /**If the request contains range headers – for example, when the user drags to the
middle of the video and starts playing from that point – we need to convert the
received range headers to the start and end positions, which will correspond with the
correct chunks stored in GridFS */
    res.writeHead(206, {
      /**We also set the response headers with additional file details, including content length, range, and
type. */
        'Accept-Ranges': 'bytes',
/**The content length will now be the total size of the content within the defined range. Therefore, the readable stream that's piped back to the response, in this case,
will only contain the chunks of file data that fall within the start and end ranges. */
        'Content-Length': chunksize,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + req.file.length,
        'Content-Type': req.file.contentType
    })

    /**if the request does not contain range headers, we stream back
the whole video file using gridfs.openDownloadStream, which gives us a readable
stream of the corresponding file stored in GridFS */
    let downloadStream = gridfs.openDownloadStream(req.file._id, {
      // We pass the start and end values that have been extracted from the header as a range to gridfs.openDownloadStream
      /**These start and end values specify the 0-based offset in bytes to start streaming from and stop streaming before. */
      start, end: end+1})
    /**This is piped with the response sent
back to the client. In the response header, we set the content type and total length of
the file. */
    downloadStream.pipe(res)
    downloadStream.on('error', () => {
      res.sendStatus(404)
    })
    /**The final readable stream that's piped to the response after a request is received at this get video API can be rendered directly in a basic HTML5 media player or a Reactflavored
media player in the frontend view. */
    downloadStream.on('end', () => {
      res.end()
    })
  } else {
      res.header('Content-Length', req.file.length)
      res.header('Content-Type', req.file.contentType)

      let downloadStream = gridfs.openDownloadStream(req.file._id)
      downloadStream.pipe(res)
      downloadStream.on('error', () => {
        res.sendStatus(404)
      })
      downloadStream.on('end', () => {
        res.end()
      })
  }
}

/**The listPopular controller method will query the Media collection and retrieve nine media documents
that have the highest views in the whole collection. */
const listPopular = async (req, res) => {
  try{
    /**The result that's returned by the query to the Media collection is sorted by the number of views in descending order and limited to nine. Each media document in
this list will also contain the name and ID of the user who posted it since we are calling populate to add these user attributes. */
    let media = await Media.find({}).limit(9)
    .populate('postedBy', '_id name')
    .sort('-views')
    .exec()
    res.json(media)
  } catch(err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**The listByUser controller method will query the Media collection to find media documents that have
postedBy values matching with the userId attached as a parameter in the URL. */
const listByUser = async (req, res) => {
  try{
    let media = await Media.find({postedBy: req.profile._id})
  /**. Each media document in this list will also contain the name and ID of the user who posted it since we are
calling populate to add these user attributes */
      .populate('postedBy', '_id name')
      // The result that's returned from the query to the Media collection is sorted by the date it was created on, with the latest post showing up first
      .sort('-created')
      .exec()
    res.json(media)
  } catch(err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
      })
  }
}

/**After the media is updated from this incrementViews method, the read controller method is invoked. The read controller method will
simply return the retrieved media document in response to the requesting client, */
const read = (req, res) => {
  return res.json(req.media)
}

/**A GET request to this API will execute the incrementViews controller method next, which will find the matching media record and increment the views value by 1,
before saving the updated record to the database */
const incrementViews = async (req, res, next) => {
  try {
    /**This method will increment the number of views for a given media by 1 every time
this read media API is called */
    await Media.findByIdAndUpdate(req.media._id, {$inc: {"views": 1}}, {new: true}).exec()
    next()
  } catch(err){
      return res.status(400).json({
          error: errorHandler.getErrorMessage(err)
      })
  }
}

const update = async (req, res) => {
  try {
    let media = req.media
    media = extend(media, req.body)
    media.updated = Date.now()
    await media.save()
    res.json(media)
  } catch(err){
    return res.status(400).json({
        error: errorHandler.getErrorMessage(err)
    })
  }
}

const isPoster = (req, res, next) => {
  let isPoster = req.media && req.auth && req.media.postedBy._id == req.auth._id
  if(!isPoster){
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

const remove = async (req, res) => {
  try {
    let media = req.media
    let deletedMedia = await media.remove()
    gridfs.delete(req.file._id)
    res.json(deletedMedia)
  } catch(err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listRelated = async (req, res) => {
  try {
    let media = await Media.find({ "_id": { "$ne": req.media }, "genre": req.media.genre})
      .limit(4)
      .sort('-views')
      .populate('postedBy', '_id name')
      .exec()
    res.json(media)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  mediaByID,
  video,
  listPopular,
  listByUser,
  read,
  incrementViews,
  update,
  isPoster,
  remove,
  listRelated
}
