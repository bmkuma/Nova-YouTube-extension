const Plugins = {
   list: [
      // 'plugins/_blank_plugin.js', // for example

      'player/ad-skip-button.js',
      'player/speed.js',
      'player/volume.js',
      'player/hud.js',
      'player/quality.js',
      'player/autostop.js',
      'player/autopause.js',
      'player/theater-mode.js',
      'player/pause-background.js',
      'player/fullscreen-on-playback.js',
      'player/control-autohide.js',
      'player/hotkeys-focused.js',
      'player/pin.js',
      'player/time-jump.js',
      'player/time-remaining.js',
      'player/float-progress-bar.js',
      'player/no-sleep.js',
      'player/loop.js',
      'player/resume-playback.js',
      // 'player/-thumb-pause.js',
      'player/buttons-custom.js',
      'player/subtitle-transparent.js',
      // 'player/subtitle-lang.js',
      // 'player/miniplayer-disable.js',
      'player/unblock-region.js',
      // 'player/next-autoplay.js',
      'player/fullscreen-scroll.js',

      'other/annotations.js',
      'other/thumbs-clear.js',
      'other/thumbs-title-normalize.js',
      // 'other/thumbs-rating.js',
      'other/thumbs-watched.js',
      'other/channel-tab.js',
      // 'other/dark-theme.js',
      'other/title-time.js',
      'other/scroll-to-top.js',
      'other/thumb-title-filter.js',
      'other/search-channel-filter.js',
      'other/thumbs-hide.js',
      'other/shorts-redirect.js',
      // 'other/shorts-hide.js',
      // 'other/premieres-hide.js',
      // 'other/thumbnails-mix-hide.js',
      // 'other/streams-hide.js',
      'other/playlist-rss.js',
      'other/thumbs-sort.js',
      'other/stop-channel-trailer.js',
      'other/miniplayer-disable.js',

      'details/videos-count.js',
      'details/description-expand.js',
      'details/description-popup.js',
      'details/timestamps-scroll.js',
      'details/redirect-clear.js',
      // 'details/quick-menu.js',

      'comments/visibility.js',
      'comments/square-avatars.js',
      'comments/popup.js',
      'comments/expand.js',

      'sidebar/related-visibility.js',
      'sidebar/playlist-autoplay.js',
      'sidebar/playlist-duration.js',
      'sidebar/playlist-reverse.js',
      'sidebar/livechat.js',
      'sidebar/channel-link.js',
      // 'sidebar/playlist-skip-liked.js',

      'header/search.js',
      'header/short.js',
      'header/unfixed.js',
      'header/logo.js',
   ],

   // for test
   // list: [
   //    'other/annotations.js',
   //    'sidebar/playlist-duration.js',
   //    'sidebar/playlist-reverse.js',
   //    'comments/expand.js',
   //    'details/description-expand.js',
   //    'details/description-popup.js',
   //    'details/videos-count.js',
   // ],
   // list: [
   //    // 'comments/square-avatars.js',
   //    // 'player/autostop.js',
   //    'sidebar/-playlist-skip-liked.js',
   // ],

   load(list) {
      (list || this.list)
         .forEach(plugin => {
            try {
               this.injectScript(chrome.runtime.getURL('/plugins/' + plugin));
            } catch (error) {
               console.error(`plugin loading failed: ${plugin}\n${error.stack}`);
            }
         })
   },

   injectScript(source = required()) {
      const script = document.createElement('script');

      if (source.endsWith('.js')) {
         script.src = source;
         script.defer = true; // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-defer:~:text=defer,-This
         // script.async = true;

      } else { // injectCode
         script.textContent = source.toString();
         // script.src = "data:text/plain;base64," + btoa(source);
         // script.src = 'data:text/javascript,' + encodeURIComponent(source)
      }

      (document.head || document.documentElement).append(script);

      script.onload = () => {
         // console.log('script injected:', script.src || script.textContent.substr(0, 100));
         script.remove(script); // Remove <script> node after injectScript runs.
      };
   },

   // injectFunction(func, args) {
   //    // console.debug('injectFunction', ...arguments);
   //    this.injectScript(`(${func})(${args});`);
   // },

   run: ({ user_settings, app_ver }) => {
      // console.debug('plugins_executor', ...arguments);
      if (!window.nova_plugins?.length) return console.error('nova_plugins empty', window.nova_plugins);
      if (!user_settings) return console.error('user_settings empty', user_settings);

      NOVA.currentPage = (function () {
         const [page, channelTab] = location.pathname.split('/').filter(Boolean);
         return (['channel', 'c', 'user'].includes(page)
            // fix non-standard link:
            // https://www.youtube.com/pencilmation
            // https://www.youtube.com/rhino
            || ['featured', 'videos', 'playlists', 'community', 'channels', 'about'].includes(channelTab)
            // https://www.youtube.com/clip/Ugkx2Z62NxoBfx_ZR2nIDpk3F2f90TV4_uht
         ) ? 'channel' : page == 'clip' ? 'watch' : page || 'home';
      })();
      // console.debug('NOVA.currentPage', NOVA.currentPage);

      const isMobile = location.host == 'm.youtube.com';

      let logTableArray = [],
         logTableStatus,
         logTableTime;

      // console.groupCollapsed('plugins status');

      window.nova_plugins?.forEach(plugin => {
         const pagesAllowList = plugin?.run_on_pages?.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
         // reset logTable
         logTableTime = 0;
         logTableStatus = false;

         if (!pluginChecker(plugin)) {
            console.error('Plugin invalid\n', plugin);
            alert('Plugin invalid: ' + plugin?.id);
            logTableStatus = 'INVALID';

         } else if (plugin.was_init && !plugin.restart_on_transition) {
            logTableStatus = 'skiped';

         } else if (!user_settings.hasOwnProperty(plugin.id)) {
            logTableStatus = 'off';

         } else if (
            (
               pagesAllowList?.includes(NOVA.currentPage)
               || (pagesAllowList?.includes('all') && !pagesAllowList?.includes('-' + NOVA.currentPage))
            )
            && (!isMobile || (isMobile && !pagesAllowList?.includes('-mobile')))
         ) {
            try {
               const startTableTime = performance.now();
               plugin.was_init = true;
               plugin._runtime(user_settings);
               // plugin._runtime.apply(plugin, [user_settings])
               logTableTime = (performance.now() - startTableTime).toFixed(2);
               logTableStatus = true;

            } catch (err) {
               console.groupEnd('plugins status'); // out-of-group display
               console.error(`[ERROR PLUGIN] ${plugin.id}\n${err.stack}\n\nPlease report the bug: https://github.com/raingart/Nova-YouTube-extension/issues/new?body=` + encodeURIComponent(app_ver + ' | ' + navigator.userAgent));

               if (user_settings.report_issues && _pluginsCaptureException) {
                  _pluginsCaptureException({
                     'trace_name': plugin.id,
                     'err_stack': err.stack,
                     'app_ver': app_ver,
                     'confirm_msg': `ERROR in Nova YouTube™\n\nCrash plugin: "${plugin.title}"\nPlease report the bug or disable the plugin\n\nOpen popup to report the bug?`,
                  });
               }

               console.groupCollapsed('plugins status'); // resume console group
               logTableStatus = 'ERROR';
            }
         }

         logTableArray.push({
            'launched': logTableStatus,
            'name': plugin?.id,
            'time init (ms)': logTableTime,
         });
      });
      console.table(logTableArray);
      console.groupEnd('plugins status');

      function pluginChecker(plugin) {
         const result = plugin?.id && plugin.run_on_pages && 'function' === typeof plugin._runtime;
         if (!result) {
            console.error('plugin invalid:\n', {
               'id': plugin?.id,
               'run_on_pages': plugin?.run_on_pages,
               '_runtime': 'function' === typeof plugin?._runtime,
            });
         }
         return result;
      }
   },
}
