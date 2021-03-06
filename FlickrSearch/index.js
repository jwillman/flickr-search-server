const axios = require("axios");

module.exports = async function (context, req) {
    context.log("JavaScript HTTP trigger function processed a request.");

    const searchstring =
        req.query.searchstring || (req.body && req.body.searchstring);
    const results = req.query.results || (req.body && req.body.results);

    // TODO stay under 3600 queries per hour
    // TODO cache results
    // TODO error handling

    const url = `http://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${process.env.FLICKR_API_KEY}&text=${searchstring}&format=json&nojsoncallback=1`;

    const response = await axios.get(url);

    // Url format: https://live.staticflickr.com/{server-id}/{id}_{secret}.jpg
    var photoUrls = [];
    for (let step = 0; step < results; step++) {
        let server_id = response.data.photos.photo[step].server;
        let id = response.data.photos.photo[step].id;
        let secret = response.data.photos.photo[step].secret;
        let url = `https://live.staticflickr.com/${server_id}/${id}_${secret}.jpg`;
        photoUrls.push(url);
    }

    context.res = {
        body: {
            photoUrls: photoUrls,
        },
        headers: {
            "Content-Type": "application/json",
        },
    };
};
