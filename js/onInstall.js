console.debug("init onInstall.js");

// installed new version
chrome.runtime.onInstalled.addListener(details => {
   chrome.storage.sync.get(null, storage => {
      const manifest = chrome.runtime.getManifest();
      console.debug(`app ${details.reason} ${details.previousVersion} to ` + manifest.version);

      switch (details.reason) {
         case 'install':
            if (storage && Object.keys(storage).length) return;

            // notify(
            //    "Welcome!",
            //    "Thanks for installing the extension. To get started please visit the options menu by clicking here.",
            //    -1
            // );

            if (confirm(`${manifest.short_name}: no configuration data found!\nActivate default plugins and settings?`)) {
               const defaultSettings = { "ad-skip-button": "on", "header-short": "on", "pause-background-tab": "on", "player-float-progress-bar": "on", "player-hotkeys-focused": "on", "player_float_progress_bar_height": "3", "player_float_progress_bar_opacity": "0.7", "rate-wheel": "on", "rate_default": "1", "rate_hotkey": "altKey", "rate_step": "0.25", "report_issues": "on", "scroll-to-top": "on", "square-avatars": "on", "tabs": "on", "thumbnails-title-normalize": "on", "video-quality": "on", "video_quality": "hd1080", "video_quality_manual_save_in_tab": "on", "volume-wheel": "on", "volume_hotkey": "none", "volume_level_default": "100", "volume_step": "10" };
               Storage.setParams(defaultSettings, 'sync');
               console.debug('Apply default configuration');

            } else {
               chrome.runtime.openOptionsPage();
            }
            break;

         case 'update':
            // notify(
            //    "Update installed!",
            //    "NovaTube has just been updated, please click here to visit the options menu & enable any new settings.",
            //    10000
            // );

            // updateKeyStorage
            Storage.getParams(settings => {
               const keyRenameTemplate = {
                  // 'oldKey': 'newKey',
                  'disable_in_frame': 'exclude_iframe',
                  'custom-api-key': 'user-api-key',

                  // for 'thumbs-hide'
                  'shorts-disable': 'shorts_disable',
                  'premiere-disable': 'premieres_disable',
                  'premieres-disable': 'premieres_disable',
                  'streams-disable': 'live_disable',
                  'streams_disable': 'live_disable',
                  'thumbnails-mix-hide': 'thumb_mix_disable',
                  'thumbnails_mix_hide': 'thumb_mix_disable',
                  'player_fullscreen_mode_exit': 'player_fullscreen_mode_onpause',
               }
               for (const oldKey in settings) {
                  if (newKey = keyRenameTemplate[oldKey]) {
                     console.log(oldKey, '=>', newKey);
                     delete Object.assign(settings, { [newKey]: settings[oldKey] })[oldKey];

                     user_settings['thumbs-hide'] = true;
                  }
               }
               console.debug('new updated settings:', settings);
               Storage.setParams(settings, 'sync');
            }, 'sync');

            break;
      }
   });
});
