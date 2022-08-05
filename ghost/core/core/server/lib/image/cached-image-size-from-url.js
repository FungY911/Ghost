const debug = require('@tryghost/debug')('utils:image-size-cache');
const errors = require('@tryghost/errors');
const logging = require('@tryghost/logging');

class CachedImageSizeFromUrl {
    /**
     *
     * @param {Object} options
     * @param {Object} options.imageSize - instance with "getImageSizeFromUrl" method
     * @param {Object} options.cache - cache store instance
     */
    constructor({imageSize, cache}) {
        this.imageSize = imageSize;
        this.cache = cache;
    }

    /**
     * Get cached image size from URL
     * Always returns {object} imageSizeCache
     * @param {string} url
     * @returns {Promise<Object>} imageSizeCache
     * @description Takes a url and returns image width and height from cache if available.
     * If not in cache, `getImageSizeFromUrl` is called and returns the dimensions in a Promise.
     */
    getCachedImageSizeFromUrl(url) {
        if (!url || url === undefined || url === null) {
            return;
        }

        // image size is not in cache
        if (!this.cache.get(url)) {
            return this.imageSize.getImageSizeFromUrl(url).then((res) => {
                this.cache.set(url, res);

                debug('Cached image:', url);

                return this.cache.get(url);
            }).catch(errors.NotFoundError, () => {
                debug('Cached image (not found):', url);
                // in case of error we just attach the url
                this.cache.set(url, url);

                return this.cache.get(url);
            }).catch((err) => {
                debug('Cached image (error):', url);
                logging.error(err);

                // in case of error we just attach the url
                this.cache.set(url, url);

                return this.cache.get(url);
            });
        }

        debug('Read image from cache:', url);
        // returns image size from cache
        return this.cache.get(url);
    }
}

module.exports = CachedImageSizeFromUrl;
