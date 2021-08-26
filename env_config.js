export default {
    // If you are running against a local API on Sails, this is probably the root:
    // apiRoot: 'http://localhost:1337',

    // The online staging API:
    apiRoot: 'https://api-staging.yogo.dk',

    // Where to get images. Should be matching the API that are used.
    // Use this if you are connecting to the STAGING api.
    resizedImageServer: 'http://yogo-resized-images-staging.s3-website.eu-central-1.amazonaws.com',

    // If you are running the API yourself on a local server, you can use this URL:
    // resizedImageServer: 'http://resized-images-test.yogo.dk.s3-website.eu-west-1.amazonaws.com',

    // The clientId is needed for local development, where we don't have a custom domain. In production and staging, client is determined by the caller domain.
    clientId: 1,
    // vueMaterialThemeCssServer: 'https://vue-material-theme-css-staging.yogo.dk',

}




