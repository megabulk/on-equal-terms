var push = require('git-push');

push('./', 'https://github.com/megabulk/on-equal-terms.git', function() {
  console.log('Done!');
});