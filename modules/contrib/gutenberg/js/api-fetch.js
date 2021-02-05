/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/'use strict';

(function (wp, Drupal, drupalSettings, $) {
  function parseQueryStrings(query) {
    var match = void 0;
    var urlParams = {};

    var pl = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = function decode(s) {
      return decodeURIComponent(s.replace(pl, ' '));
    };

    while ((match = search.exec(query)) !== null) {
      if (decode(match[1]) in urlParams) {
        if (!Array.isArray(urlParams[decode(match[1])])) {
          urlParams[decode(match[1])] = [urlParams[decode(match[1])]];
        }
        urlParams[decode(match[1])].push(decode(match[2]));
      } else {
        urlParams[decode(match[1])] = decode(match[2]);
      }
    }

    return urlParams;
  }

  function errorHandler(errorResponse, reject) {
    var fallbackMessage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var errorMessage = void 0;
    if (errorResponse.responseJSON) {
      var responseJSON = errorResponse.responseJSON;
      if (typeof responseJSON.error === 'string') {
        errorMessage = responseJSON.error;
      } else if (typeof responseJSON.message === 'string') {
        errorMessage = responseJSON.message;
      }
    }

    if (!errorMessage && fallbackMessage) {
      errorMessage = fallbackMessage;
    }

    if (errorMessage) {
      Drupal.notifyError(errorMessage);
    } else {
      console.warn('API error: unexpected error message: ' + JSON.stringify(errorResponse));
    }

    reject(errorResponse);
  }

  var types = {
    page: {
      id: 1,
      labels: {
        singular_name: 'Node',
        Document: Drupal.t('Node'),
        document: Drupal.t('Node'),
        posts: Drupal.t('Nodes')
      },
      name: 'Page',
      rest_base: 'pages',
      slug: 'page',
      supports: {
        author: false,
        comments: false,
        'custom-fields': true,
        editor: true,
        excerpt: false,
        discussion: false,
        'page-attributes': false,
        revisions: false,
        thumbnail: false,
        title: false },
      taxonomies: []
    },
    block: {
      capabilities: {},
      labels: {
        singular_name: 'Block'
      },
      name: 'Blocks',
      rest_base: 'blocks',
      slug: 'wp_block',
      description: '',
      hierarchical: false,
      supports: {
        title: true,
        editor: true
      },
      viewable: true
    }
  };

  var user = {
    id: 1,
    name: 'Human Made',
    url: '',
    description: '',
    link: 'https://demo.wp-api.org/author/humanmade/',
    slug: 'humanmade',
    avatar_urls: {
      24: 'http://2.gravatar.com/avatar/83888eb8aea456e4322577f96b4dbaab?s=24&d=mm&r=g',
      48: 'http://2.gravatar.com/avatar/83888eb8aea456e4322577f96b4dbaab?s=48&d=mm&r=g',
      96: 'http://2.gravatar.com/avatar/83888eb8aea456e4322577f96b4dbaab?s=96&d=mm&r=g'
    },
    meta: [],
    _links: {
      self: [],
      collection: []
    }
  };

  var requestPaths = {
    'save-page': {
      method: 'PUT',
      regex: /\/wp\/v2\/pages\/(\d*)/g,
      process: function process(matches, data) {
        var date = new Date().toISOString();

        window.wp.node = {
          id: 1,
          type: 'page',
          date: date,
          date_gmt: date,
          title: {
            raw: document.title,
            rendered: document.title
          },
          status: 'draft',
          content: {
            raw: data.content,
            rendered: data.content
          }
        };

        return new Promise(function (resolve) {
          resolve(window.wp.node);
        });
      }
    },
    'load-node': {
      method: 'GET',
      regex: /\/wp\/v2\/pages\/(\d*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve(window.wp.node);
        });
      }
    },
    'media-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/media/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve({
            headers: {
              get: function get(value) {
                if (value === 'allow') {
                  return ['POST'];
                }
              }
            }
          });
        });
      }
    },
    'load-media': {
      method: 'GET',
      regex: /\/wp\/v2\/media\/((\d+)(.*))/,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          Drupal.toggleGutenbergLoader('show');
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/media/load/' + matches[1])
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          }).always(function () {
            Drupal.toggleGutenbergLoader('hide');
          });
        });
      }
    },
    'save-media': {
      method: 'POST',
      regex: /\/wp\/v2\/media/g,
      process: function process(matches, data, body) {
        return new Promise(function (resolve, reject) {
          var file = void 0;
          var entries = body.entries();

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var pair = _step.value;

              if (pair[0] === 'file') {
                file = pair[1];
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var formData = new FormData();
          formData.append('files[fid]', file);
          formData.append('fid[fids]', '');
          formData.append('attributes[alt]', 'Test');
          formData.append('_drupal_ajax', '1');
          formData.append('form_id', $('[name="form_id"]').val());
          formData.append('form_build_id', $('[name="form_build_id"]').val());
          formData.append('form_token', $('[name="form_token"]').val());

          Drupal.toggleGutenbergLoader('show');
          $.ajax({
            method: 'POST',

            url: Drupal.url('editor/media/upload/gutenberg'),
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false
          }).done(function (result) {
            if (Drupal.isMediaEnabled()) {
              Drupal.notifySuccess(Drupal.t('File and media entity have been created successfully.'));
            } else {
              Drupal.notifySuccess(Drupal.t('File entity has been created successfully.'));
            }
            resolve(result);
          }).fail(function (error) {
            errorHandler(error, reject);
          }).always(function () {
            Drupal.toggleGutenbergLoader('hide');
          });
        });
      }
    },
    'load-medias': {
      method: 'GET',
      regex: /\/wp\/v2\/media/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([]);
        });
      }
    },
    'load-media-library-dialog': {
      method: 'GET',
      regex: /load-media-library-dialog/g,
      process: function process(matches, data) {
        Drupal.toggleGutenbergLoader('show');
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/media/dialog'),
            data: {
              types: (data.allowedTypes || []).join(',')
            }
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          }).always(function () {
            Drupal.toggleGutenbergLoader('hide');
          });
        });
      }
    },
    'load-media-edit-dialog': {
      method: 'GET',
      regex: /load-media-edit-dialog/g,
      process: function process(matches, data) {
        Drupal.toggleGutenbergLoader('show');
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'GET',
            url: Drupal.url('media/6/edit')
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          }).always(function () {
            Drupal.toggleGutenbergLoader('hide');
          });
        });
      }
    },
    categories: {
      method: 'GET',
      regex: /\/wp\/v2\/categories\?(.*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([]);
        });
      }
    },
    users: {
      method: 'GET',
      regex: /\/wp\/v2\/users\/\?(.*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([user]);
        });
      }
    },
    taxonomies: {
      method: 'GET',
      regex: /\/wp\/v2\/taxonomies/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([]);
        });
      }
    },
    embed: {
      method: 'GET',
      regex: /\/oembed\/1\.0\/proxy\?(.*)/g,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          var data = parseQueryStrings(matches[1]);
          data.maxWidth = data.maxWidth || 800;

          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/oembed'),
            data: data
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },
    root: {
      method: 'GET',
      regex: /(^\/$|^$)/g,
      process: function process() {
        return new Promise(function (resolve) {
          return resolve({
            theme_supports: {
              formats: ['standard', 'aside', 'image', 'video', 'quote', 'link', 'gallery', 'audio'],
              'post-thumbnails': true
            }
          });
        });
      }
    },
    themes: {
      method: 'GET',
      regex: /\/wp\/v2\/themes\?(.*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          return resolve([{
            theme_supports: {
              formats: ['standard', 'aside', 'image', 'video', 'quote', 'link', 'gallery', 'audio'],
              'post-thumbnails': true,
              'responsive-embeds': false
            }
          }]);
        });
      }
    },

    'load-type-page': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/page/g,
      process: function process() {
        return new Promise(function (resolve) {
          return resolve(types.page);
        });
      }
    },
    'load-type-block': {
      method: 'GET',
      regex: /\/wp\/v2\/types\/wp_block/g,
      process: function process() {
        return new Promise(function (resolve) {
          return resolve(types.block);
        });
      }
    },
    'load-types': {
      method: 'GET',
      regex: /\/wp\/v2\/types($|\?(.*))/g,
      process: function process() {
        return new Promise(function (resolve) {
          return resolve(types);
        });
      }
    },

    'update-block': {
      method: 'PUT',
      regex: /\/wp\/v2\/blocks\/(\d+)/g,
      process: function process(matches, data) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'PUT',
            url: Drupal.url('editor/reusable-blocks/' + data.id),
            data: data
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },

    'delete-block': {
      method: 'DELETE',
      regex: /\/wp\/v2\/blocks\/(\d+)/g,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'DELETE',
            url: Drupal.url('editor/reusable-blocks/' + matches[1])
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },

    'insert-block': {
      method: 'POST',
      regex: /\/wp\/v2\/blocks/g,
      process: function process(matches, data) {
        return new Promise(function (resolve, reject) {
          var formData = new FormData();
          formData.append('title', data.title);
          formData.append('content', data.content);

          $.ajax({
            method: 'POST',
            url: Drupal.url('editor/reusable-blocks'),
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },
    'load-block': {
      method: 'GET',
      regex: /\/wp\/v2\/blocks\/(\d*)/g,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/reusable-blocks/' + matches[1])
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },
    'load-blocks': {
      method: 'GET',
      regex: /\/wp\/v2\/blocks\?(.*)/g,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/reusable-blocks'),
            data: parseQueryStrings(matches[1])
          }).done(resolve).fail(function (error) {
            errorHandler(error, reject);
          });
        });
      }
    },
    'block-options': {
      method: 'OPTIONS',
      regex: /\/wp\/v2\/blocks/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve({
            headers: {
              get: function get(value) {
                if (value === 'allow') {
                  return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                }
              }
            }
          });
        });
      }
    },

    'search-content': {
      method: 'GET',
      regex: /\/wp\/v2\/search\?(.*)/g,
      process: function process(matches) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            method: 'GET',
            url: Drupal.url('editor/search'),
            data: parseQueryStrings(matches[1])
          }).done(function (result) {
            resolve(result);
          }).fail(function (err) {
            reject(err);
          });
        });
      }
    },

    'load-autosaves': {
      method: 'GET',
      regex: /\/wp\/v2\/(.*)\/autosaves\?(.*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([]);
        });
      }
    },
    'save-autosaves': {
      method: 'POST',
      regex: /\/wp\/v2\/(.*)\/autosaves\?(.*)/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve([]);
        });
      }
    },
    'load-me': {
      method: 'GET',
      regex: /\/wp\/v2\/users\/me/g,
      process: function process() {
        return new Promise(function (resolve) {
          resolve(user);
        });
      }
    }
  };

  function processPath(options) {
    if (!options.path) {
      return new Promise(function (resolve) {
        return resolve('No action required.');
      });
    }

    for (var key in requestPaths) {
      if (requestPaths.hasOwnProperty(key)) {
        var requestPath = requestPaths[key];
        requestPath.regex.lastIndex = 0;
        var matches = requestPath.regex.exec('' + options.path);

        if (matches && matches.length > 0 && (options.method && options.method === requestPath.method || requestPath.method === 'GET')) {
          return requestPath.process(matches, options.data, options.body);
        }
      }
    }

    return new Promise(function (resolve, reject) {
      return reject(new Error('API handler not found - ' + JSON.stringify(options)));
    });
  }

  wp.apiFetch = processPath;
})(wp, Drupal, drupalSettings, jQuery);