var player = radiodan.player.create(1);

var playlists = document.querySelector('.playlists');

var vol = document.querySelector('.volume');
vol.addEventListener('change', function (evt) {
  console.log('Volume', vol.value);
  player.volume({ value: vol.value });
});

setTimeout(function () {
  player.volume({ diff: -1 });
}, 1000);

player.on('volume', function(content) {
  console.log('changing volume to ', content.volume);
  vol.value = content.volume;
});

player.on('playlist', function (content) {
  console.log('changing playlist');
  var html = '';

  console.log('playlist: ', content);

  if (content.length == 0) {
    html = '<li>Playlist is empty</li>';
  } else {
    html = content.map(function (item) {
      return '<li>' + (item.Name || '') + '</li>';
    }).join('\n');
  }

  playlists.innerHTML = html;
});

player.on('player', function (content) {
  console.log('player changed', content);
});

var playButton = document.querySelector('.play');
playButton.addEventListener('click', function () {
  player.play();
});

var pauseButton = document.querySelector('.pause');
pauseButton.addEventListener('click', function () {
  player.pause({ value: true });
});

var playlistClearButton = document.querySelector('.playlist-clear');
playlistClearButton.addEventListener('click', function () {
  player.clear();
});

var playlistInput = document.querySelector('.playlist input');
var playlistButton = document.querySelector('.playlist button');

playlistButton.addEventListener('click', function () {
  if (playlistInput.value == '') { return; }

  player.add({ playlist: [
    playlistInput.value
  ]}).then(
    function () {
      console.log('Done');
      playlistInput.value = '';
    },
    function () {
      console.error('Couldn\'t add to playlist');
    }
  );
  console.log('Loading...');

});

var streams = document.querySelector('.streams');
streams.addEventListener('click', function (evt) {
  var target = evt.target.parentNode;

  console.log('click', evt);

  evt.preventDefault();

  if (target.nodeName !== 'A') { return; }

  var url = target.getAttribute('href');

  if (url) {
    player.clear();
    player.add({ playlist: [url] });
    player.play();
  } else {
    console.log('No url for stream');
  }
}, false);

var $search = document.querySelector('.search');
var $searchInput   = $search.querySelector('input');
var $searchButton  = $search.querySelector('button');
var $searchResults = $search.querySelector('ul');
var $searchStatus  = $search.querySelector('.msg');
$searchInput.addEventListener('input', performSearch);
$searchButton.addEventListener('click', performSearch);

function performSearch() {
  var term = $searchInput.value;
  if (term.length > 0) {
    search(term);
  } else {
    clearSearchResults();
  }
}

function search(term) {
  player.search({ any: term })
        .then(showResults)
        .then(hideLoadingIndicator, hideLoadingIndicator);
  showLoadingIndicator();
}

function showResults(results) {
  var html = '';

  console.log(results);

  if (results && results[0]) {
    html = results.map(htmlForResult).join('');
  }

  $searchResults.innerHTML = html;

  return;
}

function htmlForResult(result) {
  console.log('result', result);
  var html ='<li>'
          +   '<a>'
          +     result.Title + ', ' + result.Artist
          +   '</a>'
          + '</li>';
  console.log(html);
  return html;
}

function clearSearchResults() {
  $searchResults.innerHTML = '';
}

function showLoadingIndicator() {
  $searchStatus.innerHTML = 'Loading';
}

function hideLoadingIndicator() {
  $searchStatus.innerHTML = '';
}



getJSON('http://bbcservices.herokuapp.com/services.json', buildServicesList);

function buildServicesList(json) {
  streams.innerHTML = json.services.map(function (service) {
   if (service.streams.length > 0) {
     return '<li>'
           +   '<a href="' + service.streams[0].url + '">'
           +     '<img src="' + service.logos.svg + '" />'
           +     '<span>' + (service.now_and_next[0].brand || '') + '</span>'
           +   '</a>'
           + '</li>';
   } else {
     return '';
   }
  }).join('');
}
