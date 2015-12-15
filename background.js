// Anything shorter than this is surely not an ID, right?
var MIN_ID_LENGTH = 5;

function copyToPasteboard(str) {
  console.log('Copying "' + str + '" to pasteboard');
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = str;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}

function getComponentScore(component) {
  // Components shorter than MIN_ID_LENGTH are unlikely to be IDs
  if (component.length < MIN_ID_LENGTH) {
    return 0;
  }

  // Components with non-alphanumeric characters are unlikely to
  // be IDs
  if (component.match(/\W/)) {
    return 0;
  }

  // Otherwise, we favour components with lots of digits over those with
  // fewer digits.
  var num_digits = 0;
  component.split('').forEach(function(char) {
    if (char.match(/[0-9a-f]/i)) {
      num_digits++;
    }
  });

  return num_digits / component.length;
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var url = tab.url;
  var components = []; // List of URL components that might be an ID

  // Remove everything up to and including the end of the domain. e.g. given
  // http://foo.com/bar/wibble?baz=123#456, this regex renders
  // "bar/wibble?baz=123#456"
  var url_minus_domain = tab.url.replace(/^.+:\/\/.+?\//, '');

  // Look for a fragment, consider it as a possible ID
  var remainder_and_fragment = url_minus_domain.split('#');
  if (remainder_and_fragment.length > 1) {
    // Add the fragment to the list of possible IDs
    components.push(remainder_and_fragment[1]);
  }

  // Look for a query string, consider its values as possible IDs
  var path_and_query = remainder_and_fragment[0].split('?');
  if (path_and_query.length > 1) {
    var query_pairs = path_and_query[1].split('&');
    query_pairs.forEach(function(query_pair) {
      var key_value = query_pair.split('=');
      if (key_value.length > 1) {
        components.push(key_value[1]);
      }
    });
  }

  var path_components = path_and_query[0].split('/');
  path_components.forEach(function(path_component) {
    if (path_component.length > 0) {
      components.push(path_component);
    }
  });

  var bestScore = 0;
  var mostLikelyIDComponent = null;
  components.forEach(function(component) {
    var score = getComponentScore(component);
    console.log('Component: "' + component + '", score: ' + score);
    if (score > bestScore) {
      mostLikelyIDComponent = component;
      bestScore = score;
    }
  });

  if (bestScore > 0) {
    copyToPasteboard(mostLikelyIDComponent);
  } else {
    copyToPasteboard(tab.url);
  }
});
