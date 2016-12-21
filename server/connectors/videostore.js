/* connectors/videostore.js */

module.exports = (function() {

  const Promise = require("promise");
  const cloudinary = require ('cloudinary');
  const tmp = require("tmp");
  const fs = require("fs");

  cloudinary.config({
    cloud_name: "living-connections",
    api_key: "425898524282428",
    api_secret: "7pPjCUilLoTETVKv9yRfrh-TwIo"
  });

  function saveVideo(buffer) {

    console.log("saveVideo:", typeof buffer, buffer.length);

    return new Promise(function(resolve, reject) {

      tmp.file(function(err, path, fd, cleanupCallback) {

        if (err) {
          reject(err);
          return;
        }

        console.log("saveVideo: temp file", path, fd);

        fs.write(fd, buffer, 0, buffer.length, 0, function(err, written) {

          if (err) {
            reject(err);
            return;
          }

          fs.closeSync(fd);
          console.log("saveVideo: written", written);

          cloudinary.uploader.upload(path, function(result) {

            // TODO: how to do error handling???
            if (!result || !result.public_id) {
              reject(result);
              return;
            }

            console.log("saveVideo: from cloudinary", result); 

            resolve({
              id: result.public_id,
              url: result.url,
              storageSystemId: 1
            });

            cleanupCallback();

          }, {
            resource_type: "video"
          });
        });
      });
    });
  }

  return {
    saveVideo: saveVideo
  }
})();
