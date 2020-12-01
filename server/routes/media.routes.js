import express from 'express'
import userCtrl from '../controllers/user.controller'
import authCtrl from '../controllers/auth.controller'
import mediaCtrl from '../controllers/media.controller'

const router = express.Router()

/**a create media API in the backend to allow users to create new media posts on the application. e API will receive a POST request at '/api/media/new/:userId' with the multipart body content containing the media
fields and the uploaded video file. */
router.route('/api/media/new/:userId')
/**A POST request to the create route URL, /api/media/new/:userId, will make sure the user is signed in and then initiate the create method in the media controller. */
    .post(authCtrl.requireSignin, mediaCtrl.create)

/**To retrieve the video file associated with a single media post, we will implement a get video API that will accept a GET request at '/api/medias/video/:mediaId' and
query both the Media collection and GridFS files. */
router.route('/api/media/video/:mediaId')
    .get(mediaCtrl.video)

/**-For popular media, we will set up a route that receives a GET request at /api/media/popular.
 * A GET request to this URL will invoke the listPopular method
 */
router.route('/api/media/popular')
    .get(mediaCtrl.listPopular)

/**The :mediaId parameter in the route path will be processed by the mediaByID method It retrieves the media corresponding to this ID from the
database and attaches it to the request object, so it can be accessed in the next method.*/
router.route('/api/media/related/:mediaId')
 /**The API will receive a GET request at '/api/media/related/:mediaId', and the route */
    .get(mediaCtrl.listRelated)

    /**To be able to retrieve a list of media that's been uploaded by a specific user from the database, we will set up an API with a route that accepts a GET request at
'/api/media/by/:userId' */
router.route('/api/media/by/:userId')
/**A GET request to this route will invoke the listByUser method */
    .get(mediaCtrl.listByUser)

    /**To implement the read media API in the backend, we will start by adding a GET route that queries the Media collection with an ID and returns the media document in the
response */
router.route('/api/media/:mediaId')
    .get( mediaCtrl.incrementViews, mediaCtrl.read)
/**, we will need an API that allows us to update existing media in the database if the user making the request is the authorized creator of the given media
post. */
/////////////////////////////////////////////////////////////////////
/**When a PUT request is received at 'api/media/:mediaId', the server will ensure the signed-in user is the original poster of the media content by calling the isPoster
controller method */
    .put(authCtrl.requireSignin, mediaCtrl.isPoster, mediaCtrl.update)
    /**backend, which will accept a DELETE request from a client at /api/media/:mediaId. */
    /**When the server receives a DELETE request at '/api/media/:mediaId', it will make sure the signed-in user is the original poster of the media by invoking the
isPoster controller method */
    .delete(authCtrl.requireSignin, mediaCtrl.isPoster, mediaCtrl.remove)

    // we will declare the create media route and utilize the userByID method from the user controller
    /**The userByID method processes the :userId parameter that's passed in the URL and retrieves the associated user from the database.
     * The user object becomes available in the request object to be used in the next method that will be executed.
     */
router.param('userId', userCtrl.userByID)

/**declare the route above and along with a way to handle the :mediaId parameter in the URL. */
/////////////////////////////////////////////////////////////////////////////////////////////////
/**The :mediaId parameter in the route URL will be processed in the mediaByID controller to fetch the associated document from the Media collection and file details
from GridFS */
router.param('mediaId', mediaCtrl.mediaByID)

export default router
