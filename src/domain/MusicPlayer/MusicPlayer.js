import ItunesRepository from '../itunes/ItunesRepository';
import ErrorDispatcher from '../ErrorDispacher';
import MusicPlayerList from '../../components/MusicPlayerList/MusicPlayerList';
import Player from '../../components/Player/Player';
import UiDomElementsFactory from '../factories/UiDomElementsFactory';
import SongFactory from '../factories/SongFactory';
import config from '../config';


class MusicPlayer {

    constructor() {
        this.state = { page: 'playlistPage' };
        this._searchTerm = '';
        this._playListSongs = [];
        this._musicPlayerDomElement = document.querySelector('#'+config.get('musicPlayerDomElement'));
        this._currentPlayingSong;
        this._render = this.render;
        this.playListComponent;
        this.playerComponent;
    }

    render (){
        if (this.state.page === 'playlistPage') {
            this.renderPlaylistPage();
        }
        if (this.state.page === 'playerPage') {
            this.renderPlayerPage();
        }
    }

    renderPlaylistPage () {
        this._musicPlayerDomElement.innerHTML = '';
        let form, input, submit;
        form = UiDomElementsFactory.createDomElement('form', {className: 'MusicPlayer-SearchForm'});
        input = UiDomElementsFactory.createDomElement('input', {type: 'text', id: 'MusicPlayer-SearchForm-SearchTerm'});
        submit = UiDomElementsFactory.createDomElement('input', {type: 'submit', value: 'Search'});

        form.appendChild(input);
        form.appendChild(submit);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._searchTerm = document.querySelector('#MusicPlayer-SearchForm-SearchTerm').value;
            this.getPlayListItems();
        });
        this._musicPlayerDomElement.appendChild(form);
        this._musicPlayerDomElement.appendChild(UiDomElementsFactory.createDomElement('div', {id: config.get('musicPlayerListDomElement')}));
    }

    getPlayListItems () {
        if (this.isValidSearchTerm()) {
            ItunesRepository.getSearchResults(this._searchTerm).then ((resp) => {
                this._playListSongs = [];
                resp.results.forEach( songData =>
                    this._playListSongs.push(SongFactory.createSongEntity(songData))
                );
                this.renderPlayList();
            }).catch((error) => {
                ErrorDispatcher.dispatchError('App--getSectionsFromApi: ' + error.message);
            });
        }
    }

    isValidSearchTerm(){
        let isValid = false;
        if (this._searchTerm !== '' ) {
            isValid = true;
            this._searchTerm.split(' ').join('+');
        }
        return isValid;
    }

    renderPlayList () {
        this.playListComponent = new MusicPlayerList(this, this._playListSongs);
        this.playListComponent.render();
    }

    renderPlayerPage () {
        this.playerComponent = new Player(this, this._playListSongs, this._currentPlayingSong);
        this.playerComponent.render();
    }
}

export default MusicPlayer;
