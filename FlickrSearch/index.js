const axios = require("axios");

module.exports = async function (context, req) {
    context.log("JavaScript HTTP trigger function processed a request.");

    const searchstring =
        req.query.searchstring || (req.body && req.body.searchstring);
    const results = req.query.results || (req.body && req.body.results);

    // TODO stay under 3600 queries per hour
    // TODO cache results

    const url = `http://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${process.env.FLICKR_API_KEY}&text=${searchstring}&format=json&nojsoncallback=1`;

    try {
        const response = await axios.get(url);

        let server_id = response.data.photos.photo[1].server;
        let id = response.data.photos.photo[1].id;
        let secret = response.data.photos.photo[1].secret;

        // https://live.staticflickr.com/{server-id}/{id}_{secret}.jpg

        context.res = {
            body: {
                photoUrls: [
                    `https://live.staticflickr.com/${server_id}/${id}_${secret}.jpg`,
                ],
            },
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.res = {
            body: {
                error: [error.response],
            },
        };
    }
};
