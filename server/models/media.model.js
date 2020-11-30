import mongoose from 'mongoose'
/**We will implement a Mongoose model to define a Media model for storing the details
of each piece of media that's posted to the application */
///////////////////////////////////////////////////////////////////////////////////////
/**The Media schema in this model will have fields to record the media title, description, genre, number of views, dates of when the media was posted and
updated, and a reference to the user who posted the media. */
const MediaSchema = new mongoose.Schema({
  /**Media title: The title field is declared to be of the String type and will be a required field for introducing the media that are uploaded to the
application: */
  title: {
    type: String,
    required: 'title is required'
  },
  /**Media description and genre: The description and genre fields will be of type String, and these will store additional details about the media
posted. The genre field will also allow us to group the different media uploaded to the application */
  description: String,
  genre: String,
  /**Number of views: The views field is defined as a Number type and will keep track of how many times the uploaded media was viewed by users in
the application */
  views: {type: Number, default: 0},
  /**Media posted by: The postedBy field will reference the user who created the media post */
  postedBy: {type: mongoose.Schema.ObjectId, ref: 'User'},
  /**Created and updated at times: The created and updated fields will be Date types, with created generated when a new media is added
and updated changed when any media details are modified */
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  }
})

/**NB:
 * The fields that were added to the schema definition will only store details about each
video that's posted to the application. In order to store the video content itself, we will
use MongoDB GridFS
 */

export default mongoose.model('Media', MediaSchema)
