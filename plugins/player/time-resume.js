window.nova_plugins.push({
   id: 'player-resume-playback',
   title: 'Resume playback time state',
   run_on_pages: 'watch',
   section: 'player',
   desc: 'On page reload - resume playback',
   _runtime: user_settings => {

      const CACHE_PREFIX = 'resume-playback-time';
      // ytplayer - not updated on page transition!
      const getCacheName = () => CACHE_PREFIX + ':' + NOVA.queryURL.get('v'); // window.ytplayer?.config?.args.raw_player_response.videoDetails.videoId
      let cacheName = getCacheName(); // for optimization

      NOVA.waitElement('#movie_player:not(.ad-showing) video')
         .then(video => {
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
            video.addEventListener('loadeddata', resumePlaybackTime.bind(video));
            // video.addEventListener('durationchange', resumePlaybackTime.bind(player)); // possible problems on streams
            // save
            video.addEventListener('timeupdate', function () {
               // console.debug('timeupdate', this.currentTime, '/', this.duration);
               if (!isNaN(this.duration)) {
                  sessionStorage.setItem(cacheName, this.currentTime);
               }
            });
         });

      function resumePlaybackTime() {
         cacheName = getCacheName();

         // YouTube History does the same
         if (!NOVA.queryURL.get('t')
            && (time = JSON.parse(sessionStorage.getItem(cacheName)))
            // fix the situation where it is impossible to replay item in the playlist
            && (time + 1) < this.duration) {
            // console.debug('last playback state', time, '/', this.duration);
            // seek method
            this.currentTime = time;

            // url param method
            // if (!sessionStorage.hasOwnProperty(cacheName)) {
            // const urlParams = new URLSearchParams(location.search);
            // urlParams.set('t', time + 's');
            // location.search = urlParams;
         }
      }

   }
});
