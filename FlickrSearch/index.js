// TODO stay under 3600 queries per hour
// TODO cache results

module.exports = async function (context, req) {
    context.log("JavaScript HTTP trigger function processed a request.");

    const name = req.query.name || (req.body && req.body.name);
    const responseMessage = name
        ? "Hello, " +
          name +
          ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            photoUrls: [
                "http://live.staticflickr.com/65535/51003805317_127bd912d2.jpg",
                "https://live.staticflickr.com/65535/51002983868_b87cf9e197.jpg",
            ],
        },
        headers: {
            "Content-Type": "application/json",
        },
    };
};

//("https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=&text=flower&format=json&nojsoncallback=1");

// const callFlickrApi = async () => {
//   const response = await fetch(photosEndpoint, {
//     method: "POST",
//     body: "myBody", // string or object
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   const myJson = await response.json(); //extract JSON from the http response
//   // do something with myJson
// };
