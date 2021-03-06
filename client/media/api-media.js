import config from '../../config/config'

/** we will add a corresponding fetch method in api-media.js to make a POST request to the API by passing the
multipart form data from the view */
const create = async (params, credentials, media) => {
  try {
    /**This create fetch method will take the current user's ID, user credentials, and the
media form data to make a POST request to the create media API in the backend. We
will use this method when the user submits the new media form to upload a new
video and post it on the application */
    let response = await fetch('/api/media/new/'+ params.userId, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: media
  })    
    return await response.json()
  } catch(err) {
    console.log(err)
  }
}

/**This API can be used in the frontend with a fetch request. You can define a
corresponding fetch method in api-media.js to make the */
const listPopular = async (signal) => {
  try {
    let response = await fetch('/api/media/popular', {
    method: 'GET',
    signal: signal,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
      return await response.json()
  } catch(err) {
    console.log(err)
  }
}

/**This API can be used in the frontend with a fetch request. You can define a
corresponding fetch method in api-media.js to make the request, similar to other
API implementations */
const listByUser = async (params) => {
  try {
    let response = await fetch('/api/media/by/'+ params.userId, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
      return await response.json()
  } catch(err) {
    console.log(err)
  }
}

/**To retrieve the media document that was sent in the response, we need to call this
read media API in the frontend using a fetch method. */
const read = async (params, signal) => {
  try {
    /**This method takes the ID of the media to be retrieved and makes a GET request to the
read API route using a fetch */
    let response = await fetch(config.serverUrl +'/api/media/' + params.mediaId, {
      /*we will update the read method in api-media.js to make sure it uses an
absolute URL to call the read API on the server. This will make the read fetch call compatible with isomorphic-fetch, so it can be
used without a problem on the server side to retrieve the media data while serverrendering
the PlayMedia component with data. */
    method: 'GET',
    signal: signal
  })
    return await response.json()
  } catch(err) {
    console.log(err)
  }
}

/**To access the update API in the frontend, we will add a corresponding fetch method
in api-media.js that takes the necessary user auth credentials and media details as
parameters before making the fetch call to this update media API */
const update = async (params, credentials, media) => {
  try {
    /**This fetch method will be used in the media edit form when the user makes updates
and submits the form */
    let response = await fetch('/api/media/' + params.mediaId, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: JSON.stringify(media)
  })    
    return await response.json()
    } catch(err) {
      console.log(err)
    }
}

/**you will  need a fetch method wch will  take
the media ID and the current user's auth credentials in order to call the delete media
API with these values. */
const remove = async (params, credentials) => {
  try {
    let response = await fetch('/api/media/' + params.mediaId, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    }
  })    
  return await response.json()
  } catch(err) {
    console.log(err)
  }
}

/**we will set up a corresponding fetch method that will be used in the PlayMedia component to retrieve the related list of media using this API. */
const listRelated = async (params, signal) => {
  try {
    /**This listRelated fetch method will take a media ID and make a GET request to the
related media list API in the backend */
    let response = await fetch('/api/media/related/'+ params.mediaId, {
    method: 'GET',
    signal: signal,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
      return await response.json()
  } catch(err) {
    console.log(err)
  }
}

export {
  create,
  listPopular,
  listByUser,
  read,
  update,
  remove,
  listRelated
}
