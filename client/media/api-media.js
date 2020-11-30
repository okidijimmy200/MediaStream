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
    method: 'GET',
    signal: signal
  })
    return await response.json()
  } catch(err) {
    console.log(err)
  }
}

const update = async (params, credentials, media) => {
  try {
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

const listRelated = async (params, signal) => {
  try {
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
