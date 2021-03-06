const axios = require("axios");
const NodeCache = require("node-cache");
const fnfCache = new NodeCache();

// TODO error handling

module.exports = async function (context, req) {
    context.log("JavaScript HTTP trigger function processed a request.");

    // TODO cache results
    const searchstring =
        req.query.searchstring || (req.body && req.body.searchstring);
    const results = req.query.results || (req.body && req.body.results);

    // Stay under 3600 queries per hour
    let queryCount = fnfCache.get("queryCount");
    if (queryCount == null) queryCount = 1;
    fnfCache.set("queryCount", queryCount + 1);

    let queriesStartTime = fnfCache.get("queriesStartTime");
    if (queriesStartTime) {
        const milliseconds = Math.abs(Date.now() - queriesStartTime);
        const hours = milliseconds / 36e5;
        if (queryCount > 3600 && hours < 1) {
            context.res = {
                body: {
                    error: "Maximum queries per hour reached",
                },
            };
        }
        if (hours > 1) {
            fnfCache.set("queryCount", 0);
            fnfCache.set("queriesStartTime", Date.now());
        }
    } else {
        fnfCache.set("queriesStartTime", Date.now());
    }

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
