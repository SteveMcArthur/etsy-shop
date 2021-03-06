
var request = require("sync-request");
const etsyjs = require('etsy-js');
var baseURL = "https://openapi.etsy.com/v2";
/**
 * Methods in the API docs are not actually present
 * In the API url calls. What method is called actually depends
 * on whether the call is a get, put or post HTTP method. What
 * that means is that you don't actually append "updateListing" to
 * the URL but simply call put on the listing URL
 */

function buildURL(urlParts, apiKeyParam, params, limit) {
    var url = baseURL;
    urlParts.forEach(part => {
        url += "/" + part
    });
    url += "?" + apiKeyParam;
    if (params) {
        params.forEach(param => {
            url += "&" + param
        });
    }
    if (typeof limit == 'number') {
        url += "&limit=" + limit;
    } else {
        url += "&limit=100";
    }

    return url;
}

function buildOauthURL(urlParts) {
    var url = "";
    urlParts.forEach(part => {
        url += "/" + part
    });
    return url;
}

function arrayToString(arr) {
    let output = "";
    if (Array.isArray(arr)) {
        output = arr.join(",");
    } else {
        output = arr.replace(", ",",");
    }
    return output;
}

function EtsyAPI(api_key) {
    this.api_key = api_key;
    this.apiKeyParam = "api_key=" + this.api_key;
}

EtsyAPI.prototype.makeRequest = function (urlParts,params,limit) {
    var url = buildURL(urlParts, this.apiKeyParam,params,limit);
    var response = request("GET", url);
    var body = response.getBody().toString();
    return JSON.parse(body);
}
EtsyAPI.prototype.getShop = function (shop_name) {
    return this.makeRequest(["shops", shop_name]);
}
EtsyAPI.prototype.getShopListings = function (shop_name, pageNum,limit) {
    let params = ["includes=MainImage,Section"];
    if (pageNum) {
        params.push("page=" + pageNum);
    }
    limit = limit || 100;
    return this.makeRequest(["shops", shop_name, "listings", "active"], params,limit);
}
EtsyAPI.prototype.getLatestListings = function () {
    return this.makeRequest(["listings", "active"]);
}

function EtsyShop(api_key, shop_name, shared_secret, oauth_token, oauth_secret) {
    this.shop_name = shop_name;
    this.api_key = api_key;
    this.apiKeyParam = "api_key=" + this.api_key;
    this.shared_secret = shared_secret;
    this.oauth_token = oauth_token;
    this.oauth_secret = oauth_secret;
    this.client = etsyjs.client({ key: this.api_key, secret: this.shared_secret, callbackURL: 'http://localhost:3000/authorise' });
    this.client.addScope("listings_w");
}

EtsyShop.prototype.getRequest = function (urlParts) {
    var url = buildURL(urlParts, this.apiKeyParam);
    var response = request("GET", url);
    var body = response.getBody().toString();
    return JSON.parse(body);
}

EtsyShop.prototype.putRequest = function (urlParts, params) {
    var url = buildOauthURL(urlParts);
    //url += "&method=PUT"
    //var response = request("PUT", url);
    //var body = response.getBody().toString();
    //return JSON.parse(body);
    this.client.auth(this.oauth_token, this.oauth_secret).put(url, params, function (err, status, body, headers) {
        console.log(status);
        if (err) {
            console.log(err);
            return;
        }
        console.log("Updated...");
    });
}
EtsyShop.prototype.postRequest = function (urlParts, params) {
    var url = buildOauthURL(urlParts);
    //url += "&method=PUT"
    //var response = request("PUT", url);
    //var body = response.getBody().toString();
    //return JSON.parse(body);
    this.client.auth(this.oauth_token, this.oauth_secret).post(url, params, function (err, status, body, headers) {
        console.log(status);
        if (err) {
            console.log(err);
            return;
        }
        console.log("Updated...");
    });
}
EtsyShop.prototype.getListing = function (listing_id) {
    return this.getRequest(["listings", listing_id]);
}

EtsyShop.prototype.updateTags = function (listing_id, tags) {
    let theTags = arrayToString(tags)
    return this.putRequest(["listings", listing_id], { tags: theTags });
}

EtsyShop.prototype.creatListing = function (tags) {
    return this.putRequest(["listings", listing_id]);
}

EtsyShop.prototype.setCustomizable = function (listing_id, canCustomize) {
    let params = { is_customizable: "false" };
    if (canCustomize) {
        params = { is_customizable: "true" }
    }
    return this.putRequest(["listings", listing_id], params);
}

EtsyShop.prototype.setTitle = function (listing_id, newTitle) {
    if (newTitle.length < 141) {
        return this.putRequest(["listings", listing_id], { title: newTitle });
    } else {
        console.log("Skipped title longer than 140 characters: " + newTitle.length);
        console.log(newTitle);
    }
}
EtsyShop.prototype.setImage = function (listing_id, image_path, rank,overwrite) {
    const file = fs.createReadStream(image_path);
    params = {
        image: file,
        overwrite: overwrite ? 1 : 0
    };
    if(rank && (typeof rank === "number")){
        params.rank = rank;
    }
    return this.postRequest(["listings", listing_id], params);

}

EtsyShop.prototype.setDescription = function (listing_id, newDescription) {

    return this.putRequest(["listings", listing_id], { description: newDescription });

}

EtsyShop.prototype.setSKU = function (listing_id, sku) {
    //const skuArr = [sku];
    return this.putRequest(["listings", listing_id], { sku: sku });

}


module.exports.EtsyAPI = EtsyAPI;
module.exports.EtsyShop = EtsyShop;