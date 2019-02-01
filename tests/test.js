var assert = require('assert');
var EtsyAPI = new (require("../index.js").EtsyAPI)("dummykey");


describe('EtsyAPI Methods Exist', function() {

    it("Has getRequest method", function(){
        assert.ok(EtsyAPI.makeRequest,"makeRequest exists");
    });
    it("Has getShop method", function(){
        assert.ok(EtsyAPI.getShop,"getShop exists");
    });
    it("Has getShopListings method", function(){
        assert.ok(EtsyAPI.getShopListings,"getShop exists");
    });
    it("Has getLatestListings method", function(){
        assert.ok(EtsyAPI.getLatestListings,"getLatestListings exists");
    });

});