function espandi(event) {
    event.currentTarget.parentNode.querySelector('ol').classList.remove('hidden');
    event.currentTarget.parentNode.querySelector('.titolo').textContent = 'Clicca qui per nascondere la lista dei brani';
    event.currentTarget.removeEventListener('click', espandi);
    event.currentTarget.addEventListener('click', riduci);
}

function riduci(event) {
    event.currentTarget.parentNode.querySelector('ol').classList.add('hidden');
    event.currentTarget.parentNode.querySelector('.titolo').textContent = 'Clicca qui per vedere i brani';
    event.currentTarget.removeEventListener('click', riduci);
    event.currentTarget.addEventListener('click', espandi);
}

function getToken1() {
    fetch('https://accounts.spotify.com/api/token', {
    method: "post",
    body: 'grant_type=client_credentials',
    headers:
    {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
    }
    }).then(onTokenResponse).then(onInitialJson);
}

function getToken2(event) {
    fetch('https://accounts.spotify.com/api/token', {
    method: "post",
    body: 'grant_type=client_credentials',
    headers:
    {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientID + ':' + clientSecret)
    }
    }).then(onTokenResponse).then(onTokenJson);
}

function onTokenResponse(response) {
    return response.json();
}

function search_for(event) {
    event.preventDefault();
    const ricerca = document.querySelector('#ricerca').value;
    console.log('Cerco '+ ricerca);
    fetch("https://api.spotify.com/v1/search?q="+encodeURIComponent(ricerca)+"&type="+search_type.toLowerCase()+"&market=IT&limit=12", {
        headers: {
        'Authorization': 'Bearer ' + token2
        }
    }).then(onTokenResponse).then(onSearchJson);
}

function onTokenJson(json) {
    token2 = json.access_token;
}

function onAlbumJson(json) {
    var tracks = json.tracks.items;
    var tracce = document.createElement('ol');
    tracce.classList.add('hidden');
    for(let track of tracks) {
        const traccia = document.createElement('li');
        traccia.textContent = track.name;
        tracce.appendChild(traccia);
    }
    const id_album = json.id;
    const added_albums = document.querySelectorAll('span.hidden');
    for(let added_album of added_albums) {
        if(added_album.textContent === id_album) {
            added_album.parentNode.appendChild(tracce);
            added_album.parentNode.querySelector('.titolo').addEventListener('click', espandi);
        }
    }

}

function lyricsTrack(event) {
    console.log('Elaboro il testo della canzone');
    var artista = event.currentTarget.parentNode.querySelector('.autore').textContent;
    artista = artista.split(" ");
    artista = artista[1];
    var brano = event.currentTarget.parentNode.querySelector('.nome').textContent;
    console.log(artista);
    fetch('https://api.lyrics.ovh/v1/' + encodeURIComponent(artista) + '/'+ encodeURIComponent(brano)).then(onTokenResponse).then(onTrackJson);
}

function onTrackJson(json) {
    backup = document.querySelectorAll('.contenuto');
    document.querySelector('section').innerHTML = '<pre></pre>';
    document.querySelector('pre').textContent = json['lyrics'];
    let button = document.createElement('button');
    button.textContent = 'Torna indietro';
    button.addEventListener('click', goBack);
    document.querySelector('section').appendChild(button);
}

function goBack() {
    document.querySelector('section').innerHTML = '';
    for(elemento of backup) {
        document.querySelector('section').appendChild(elemento);
    }
    window.scrollTo(0, 0);
}

function onSearchJson(json) {
    console.log(json);
    document.querySelector('section').innerHTML = '';
    let resultSet = json[search_type + 's'];
    resultSet = resultSet.items;
    for(elemento of resultSet) {
        const contenuto = document.createElement('div');
        let nome_risultato = document.createElement('span');
        nome_risultato.innerHTML = elemento.name;
        nome_risultato.classList.add('nome');
        const img_risultato = document.createElement('img');
        contenuto.classList.add('contenuto');
        contenuto.appendChild(img_risultato);
        if(search_type === 'track') {
            img_risultato.src = elemento.album.images[0].url;
            img_risultato.addEventListener('click', lyricsTrack)
            let from_album = document.createElement('span');
            from_album.textContent = 'Dall\' album: ' + elemento.album.name;
            let author = document.createElement('span');
            author.classList.add('autore');
            author.textContent = 'Autore: ' + elemento.album.artists[0].name;
            contenuto.appendChild(from_album);
            contenuto.appendChild(author);
            
        } else {
            img_risultato.src = elemento.images[0].url;
        }
        contenuto.appendChild(nome_risultato);
        const id = document.createElement('span');
        id.classList.add('hidden');
        id.textContent = elemento.id;
        contenuto.appendChild(id)
        if(search_type === 'album' && elemento.album_type === 'album') {
            const album = elemento.href;
            fetch(album , {
                headers: {
                'Authorization': 'Bearer ' + token2
                }
            }).then(onTokenResponse).then(onAlbumJson);
            const titolo = document.createElement('span');
            titolo.classList.add('titolo');
            titolo.textContent = 'Clicca qui per vedere la lista dei brani';
            contenuto.appendChild(titolo);
        }
        document.querySelector('section').appendChild(contenuto);
    }

}

function tipo_ricerca(event) {
    search_type = event.currentTarget.innerHTML;
    search_type = search_type.toLowerCase();
    const flex_items = document.querySelectorAll('.flex-item');
    for(var item of flex_items){
        item.classList.remove('selected');
    }
    event.currentTarget.classList.add('selected');
}

function onInitialJson(json) {
    token1 = json.access_token;
    fetch('https://api.spotify.com/v1/browse/new-releases?country=IT&limit=12&type=album', {
        headers: {
            'Authorization' : 'Bearer ' + token1
        }
    }).then(onTokenResponse).then(onSearchJson);
}

const clientID = 'aa0f55abe62e4a869158ea660c8c983e';
const clientSecret = 'c15bba03f5054673a73c1bb2e6823c13';

var backup = undefined;
let search_type = 'album';
var token2 = getToken2();
const opzioni = document.querySelectorAll('span.flex-item');
for(var opzione of opzioni) {
    opzione.addEventListener('click', tipo_ricerca);
}
document.querySelector('form').addEventListener('submit', search_for);
var token1 = getToken1();