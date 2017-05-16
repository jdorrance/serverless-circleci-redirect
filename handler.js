'use strict';

const request = require('request');

module.exports.hello = function (event, context, cb) {
    console.log(event);
    console.log(context);
    const artifactName = event.queryStringParameters['artifactName'];

    function findPackage(_package) {
        return _package.path.endsWith(artifactName);
    }

    //const newUrl = "https://circleci.com/api/v1.1/project/github/jdorrance/ideal-nationals/latest/artifacts?circle-token=fdcdba28801b74302b17238aa86bda6807c2d58d&branch=master";
    const pathing = event.pathParameters;
    console.log(pathing);

    const newUrl = "https://circleci.com/api/v1.1/project/{vcs}/{username}/{project}/{whichBuild}/artifacts"
            .replace("{vcs}", pathing.vcs)
            .replace("{username}", pathing.username)
            .replace("{project}", pathing.project)
            .replace("{whichBuild}", pathing.whichBuild)
        + "?circle-token=" + event.queryStringParameters['circle-token']
        + "&branch=" + event.queryStringParameters['branch']
        + "&artifactName=" + artifactName;
    console.log(newUrl);
    request.get({url: newUrl, json: true}, function (error, response, body) {
        if (error) {
            cb({statusCode: 400, body: error}, 'Error in request to ' + event.url);
        } else if (body && body.find(findPackage)) {
            const packageObject = body.find(findPackage);
            console.log(packageObject);
            context.callbackWaitsForEmptyEventLoop = false;
            const returnedResponse = {
                statusCode: 302,
                headers: {
                    "Location": packageObject.url
                },
                body: ""
            };

            cb(null, returnedResponse);
        } else {
            cb({statusCode: 400}, "No artifacts found");
        }

    });

};
