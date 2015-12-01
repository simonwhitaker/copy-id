// Anything shorter than this is surely not an ID, because maths.
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

  var score = 10;
  var num_digits = 0;
  component.split('').forEach(function(char) {
    if (char.match(/[0-9a-f]/i)) {
      num_digits++;
    }
  });

  var digit_prevalence = num_digits / component.length;
  return score * digit_prevalence;
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var url = tab.url;

  var path = tab.url.replace(/^.+:\/\/.+?\//, '');
  var components = path.split('/');
  var bestScore = 0;
  var mostLikelyIDComponent = null;
  components.forEach(function(component) {
    var score = getComponentScore(component);
    // console.log('Component: "' + component + '", score: ' + score);
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