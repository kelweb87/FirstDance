import React, { Component } from 'react';
import logo from './Spotify_logo.png';
import './App.css';
import spotify from 'spotify';
import { CLIENT_KEY } from './constants';

class App extends Component {

  state = {
    userLoggedIn: false,
    userToken: false,
    firstDances: [],
    activeTrack: null
  }

  componentDidMount() {
    const token = localStorage.getItem('spotify-token');
    if (!token) {
      this.spotifyLogin();
    } else {
      this.setState({
        userLoggedIn: true,
        userToken: token
      });
    }
  }

  componentDidUpdate() {
    if (this.state.userToken && !this.state.firstDances.length) {
      this.getTracks();
    }
  }

  spotifyLogin() {
    const w = 400
    const h = 500
    const left = (screen.width / 2) - (w / 2)
    const top = (screen.height / 2) - (h / 2)
    const redirect = 'http://www.stv.kel:3000/callback.html'

    const storageChange = (e) => {
      if (e.key === 'spotify-token') {
        if (this.loginWindow) {
          this.loginWindow.close();
        }
        localStorage.setItem(e.key, e.newValue);
        console.log('e', e);
        this.setState({
          userLoggedin: true,
          userToken: e.newValue
        });
        window.removeEventListener('storage', storageChange, false);
        this.getTracks();
      }
    }
    window.addEventListener('storage', storageChange, false);

    this.loginWindow = window.open(
      `https://accounts.spotify.com/authorize/?client_id=${CLIENT_KEY}&response_type=token&redirect_uri=${encodeURIComponent(redirect)}`,
      `Spotify`,
      `menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=${w},height=${h},top=${top},left=${left}`,
      (e) => { console.log('e', e); }
    )
  }

  getTracks = () => {
    fetch(`https://api.spotify.com/v1/users/kelweb87/playlists/0XCBlwSAVrOn5ldSzaAcSr/`, {
      method: 'GET',
      headers: new Headers({ 'Authorization': 'Bearer ' + this.state.userToken }),
      withCredentials: false
    }).then(data => data.json())
    .then(data => this.storeTracks(data))
    .catch(e => console.log('e', e));
  }

  storeTracks = (data) => {
    const songs = data.tracks.items.map(item => {
      return item.track
    }).filter(item => item.preview_url);
    this.setState({
      firstDances: [ ...songs]
    })
  }

  getRandomTrack = () => {
    const track = this.state.firstDances[Math.floor(Math.random()*this.state.firstDances.length)]
    this.setState({
      activeTrack: track
    });
  }

  render() {
    const { activeTrack, userLoggedIn } = this.state;
    console.log('state', this.state);
    return (
      <div className="App">
        <h1>First Dance Generator</h1>
        <span>Powered by <img src={logo} width={100}/></span>
        {userLoggedIn && <button onClick={this.getRandomTrack}>Get First Dance</button>}
        {activeTrack && <div>
          <h1>{activeTrack.name} - {activeTrack.artists[0].name}</h1>
          <img src={activeTrack.album.images[0].url} width={200}/>
          <audio src={activeTrack.preview_url} controls autoPlay>
            Sorry, your browser doesn't support audio playback
          </audio>
          <p>Listen to the full track on <a href={activeTrack.uri}>Spotify</a></p>
        </div>}
      </div>
    );
  }
}

export default App;
