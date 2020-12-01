import PlayMedia from './media/PlayMedia'
/*For this frontend route and PlayMedia component, we specify the read fetch
method from api-media.js as the loadData method. */
import { read } from './media/api-media.js'

/*we will create a route configuration file that will list frontend React Router routes. This configuration will be used on the server to match these routes with
incoming request URLs, to check whether data must be injected before the server returns the rendered markup in response to this request. */

/*we will only list the route that renders the PlayMedia component and demonstrate how to server-render a specific
component with data injected from the backend. */
const routes = [
  {
    /* read fetch method can then be used to retrieve and inject the data into the PlayMedia view when the server generates the
markup for this component, after receiving a request at /media/:mediaId */
    path: '/media/:mediaId',
    component: PlayMedia,
    loadData: (params) => read(params)
  }

]
export default routes
