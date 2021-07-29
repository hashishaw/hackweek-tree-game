import EmberRouter from '@ember/routing/router';
import config from 'you-are-a-tree/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('play', function() {
    this.route('one');
    this.route('two');
  });
});
