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

router.route('/api/media/popular')
    .get(mediaCtrl.listPopular)

router.route('/api/media/related/:mediaId')
    .get(mediaCtrl.listRelated)

router.route('/api/media/by/:userId')
    .get(mediaCtrl.listByUser)

router.route('/api/media/:mediaId')
    .get( mediaCtrl.incrementViews, mediaCtrl.read)
    .put(authCtrl.requireSignin, mediaCtrl.isPoster, mediaCtrl.update)
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
