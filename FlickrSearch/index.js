const axios = require("axios");
const NodeCache = require("node-cache");
const fnfCache = new NodeCache();

// TODO error handling

module.exports = async function (context, req) {
    context.log("JavaScript HTTP trigger function processed a request.");

    // TODO cache results
    const searchstring = req.query.searchstring || "";
    const results = parseInt(req.query.results) || 5;
    const offset = parseInt(req.query.offset) || 0;

    // Stay under 3600 queries per hour
    if (MaxQueryLimitReached(3600)) {
        context.res = {
            body: {
                error: "Maximum queries per hour reached",
            },
        };
        return;
    }

    try {
        var photoUrls = await getPhotoUrls(
            context,
            process.env.FLICKR_API_KEY,
            searchstring,
            results,
            offset
        );
    } catch (error) {
        return;
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

async function getPhotoUrls(
    context,
    flickrApiKey,
    searchstring,
    results,
    offset
) {
    // Url format: https://live.staticflickr.com/{server-id}/{id}_{secret}.jpg
    const page = 1;
    const perPage = 100;
    const url = `http://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickrApiKey}&text=${searchstring}&format=json&nojsoncallback=1&page=${page}&per_page=${perPage}`;
    const response = await axios.get(url);
    var photoUrls = [];

    if (response.data.stat === "fail") {
        context.res = {
            body: {
                error: response.data.stat.message,
            },
        };
        throw "Flickr api error";
    }

    if (response.data.photos != null) {
        response.data.photos.photo.forEach((element) =>
            photoUrls.push(
                `https://live.staticflickr.com/${element.server}/${element.id}_${element.secret}.jpg`
            )
        );
    }

    if (results > perPage || results + offset > perPage) {
        // TODO get another page
        return photoUrls;
    }

    return photoUrls.slice(offset, results + offset);
}

function MaxQueryLimitReached(maxQueryAmount) {
    let queryCount = fnfCache.get("queryCount");
    if (queryCount == null) queryCount = 1;
    fnfCache.set("queryCount", queryCount + 1);

    let queriesStartTime = fnfCache.get("queriesStartTime");
    if (queriesStartTime) {
        const milliseconds = Math.abs(Date.now() - queriesStartTime);
        const hours = milliseconds / 36e5;
        if (queryCount > maxQueryAmount && hours < 1) {
            return true;
        }
        if (hours > 1) {
            fnfCache.set("queryCount", 0);
            fnfCache.set("queriesStartTime", Date.now());
        }
    } else {
        fnfCache.set("queriesStartTime", Date.now());
    }
    return false;
}
