window.nova_plugins.push({
   id: 'player-indicator',
   title: 'Replace HUD (bezel)',
   'title:zh': '替换默认指示器',
   'title:ja': 'デフォルトのインジケーターを置き換える',
   'title:ko': '기본 표시기 교체',
   'title:id': 'Ganti HUD (bezel)',
   'title:es': 'Reemplazar indicador predeterminado',
   'title:pt': 'Substituir o indicador padrão',
   'title:fr': "Remplacer l'indicateur par défaut",
   'title:it': 'Sostituisci HUD (cornice)',
   'title:tr': 'Varsayılan göstergeyi değiştir',
   'title:de': 'Standardkennzeichen ersetzen',
   'title:pl': 'Zamień wskaźnik standardowy',
   run_on_pages: 'watch, embed',
   section: 'player',
   // desc: '',
   _runtime: user_settings => {

      // alt:
      // https://greasyfork.org/en/scripts/376002-youtube-volume-mouse-controller
      // https://greasyfork.org/en/scripts/376155-youtube-scroll-volume
      const
         SELECTOR_ID = 'nova-player-indicator-info',
         COLOR_HUD = user_settings.player_indicator_color || '#ff0000';

      NOVA.waitElement('video')
         .then(video => {
            // volume
            video.addEventListener('volumechange', function () {
               // console.debug('volumechange', movie_player.getVolume(), this.volume); // there is a difference
               HUD.set({
                  'pt': Math.round(movie_player.getVolume()),
                  'suffix': '%',
                  // 'timeout_ms': 0,
               });
            });
            // rate
            video.addEventListener('ratechange', () => HUD.set({
               'pt': video.playbackRate,
               'suffix': 'x',
               // 'timeout_ms': 0,
            }));
         });

      // Listener default indicator
      NOVA.waitElement('.ytp-bezel-text')
         .then(target => {
            new MutationObserver(mutations => {
               let timeout_ms; // ms
               for (const mutation of mutations) {
                  // console.log('bezel mutation detected', mutation.type, target.textContent);
                  if (target.textContent) {
                     // increase delay for plugin "time-jump"
                     // target.textContent #1:"+30 sec • 10:00" - skip
                     // target.textContent #2:"chapter name • 10:00" - ok
                     if (!target.textContent.startsWith('+') && target.textContent.includes(' • ')) {
                        timeout_ms = 1800; // ms
                        // console.debug(`HUD delay increased: ${timeout_ms}ms`);
                     }
                     HUD.set({
                        'pt': target.textContent,
                        // 'suffix': '',
                        'timeout_ms': timeout_ms,
                     });
                     break;
                  }
               }
            })
               .observe(target, { childList: true }); // watch for textContent
         });

      const HUD = {
         get() {
            return this.conteiner || this.create();
         },
         // TODO The idea of ​​copying the progress bar. To display segments of time markers
         // a = el.cloneNode(true)
         // document.getElementById(SELECTOR_ID).innerHTML = a.innerHTML

         create() {
            // hide default indicator
            NOVA.css.push(
               `.ytp-bezel-text-wrapper,
               .ytp-doubletap-ui-legacy.ytp-time-seeking,
               /*.ytp-doubletap-seek-info-container,*/
               .ytp-chapter-seek {
                  display:none !important;
               }`);
            // init common css
            NOVA.css.push(
               `#${SELECTOR_ID} {
                  --color: #fff;
                  --bg-color: rgba(0,0,0,0.3);
                  --zindex: ${getComputedStyle(document.body.querySelector('.ytp-chrome-top'))['z-index'] || 60};

                  position: absolute;
                  right: 0;
                  z-index: calc(var(--zindex) + 1);
                  margin: 0 auto;
                  text-align: center;
                  opacity: 0;
                  background-color: var(--bg-color);
                  color: var(--color);
               }`);
            // template
            movie_player.insertAdjacentHTML('beforeend', `<div id="${SELECTOR_ID}"><span></span></div>`);

            this.conteiner = document.getElementById(SELECTOR_ID);
            this.hudSpan = this.conteiner.querySelector('span'); // export el

            // add to div user_settings.player_indicator_type style
            // const [indicator_type, span_align] = user_settings.player_indicator_type.split('=', 2); // 2 = max param;
            // switch (indicator_type) {
            switch (user_settings.player_indicator_type) {
               case 'bar-center':
                  Object.assign(this.conteiner.style, {
                     left: 0,
                     bottom: '20%',
                     width: '30%',
                     'font-size': '1.2em',
                  });
                  Object.assign(this.hudSpan.style, {
                     'background-color': COLOR_HUD,
                     transition: 'width 100ms ease-out 0s',
                     display: 'inline-block',
                  });
                  // if (span_align == 'left') {
                  //    Object.assign(this.hudSpan.style, {
                  //       float: 'left',
                  //    });
                  // }
                  break;

               case 'bar-vertical':
                  Object.assign(this.conteiner.style, {
                     top: 0,
                     height: '100%',
                     width: '25px',
                     'font-size': '1.2em',
                  });
                  Object.assign(this.hudSpan.style, {
                     position: 'absolute',
                     bottom: 0,
                     right: 0,
                     'background-color': COLOR_HUD,
                     transition: 'height 100ms ease-out 0s',
                     display: 'inline-block',
                     width: '100%',
                     'font-weight': 'bold',
                  });
                  break;

               // case 'text-top':
               default:
                  Object.assign(this.conteiner.style, {
                     top: 0,
                     width: '100%',
                     padding: '.2em',
                     'font-size': '1.55em',
                  });
            }
            return this.conteiner;
         },

         set({ pt = 100, suffix = '', timeout_ms = 800 }) {
            // console.debug('HUD set', ...arguments);
            if (typeof this.fateNovaHUD === 'number') clearTimeout(this.fateNovaHUD); // reset hide

            let hudConteiner = this.get();
            const text = pt + suffix;

            if (suffix == 'x') { // rate to pt
               const maxPercent = (+user_settings.rate_step % .25) === 0 ? 2 : 3;
               pt = (+pt / maxPercent) * 100;
            }
            pt = Math.round(pt);

            switch (user_settings.player_indicator_type) {
               case 'bar-center':
                  this.hudSpan.style.width = pt + '%';
                  this.hudSpan.textContent = text;
                  break;

               case 'bar-vertical':
                  this.hudSpan.style.height = pt + '%';
                  this.hudSpan.textContent = text;
                  break;

               case 'bar-top':
                  hudConteiner.style.background = `linear-gradient(to right, ${COLOR_HUD}50 ${pt}%, rgba(0,0,0,.8) ${pt}%)`;
                  this.hudSpan.style.width = pt + '%';
                  this.hudSpan.textContent = text;
                  break;

               // case 'text-top':
               default:
                  this.hudSpan.textContent = text;
            }

            hudConteiner.style.transition = 'none';
            hudConteiner.style.opacity = 1;
            // hudConteiner.style.visibility = 'visible';

            this.fateNovaHUD = setTimeout(() => {
               hudConteiner.style.transition = 'opacity 200ms ease-in';
               hudConteiner.style.opacity = null;
               // hudConteiner.style.visibility = 'hidden';
            }, timeout_ms); //total 1s = 800ms + 200ms(hudConteiner.style.transition)
         }
      };

   },
   options: {
      player_indicator_type: {
         _tagName: 'select',
         label: 'Indicator type',
         'label:zh': '指标类型',
         'label:ja': 'インジケータータイプ',
         'label:ko': '표시기 유형',
         'label:id': 'Gösterge tipi',
         'label:es': 'Tipo de indicador',
         'label:pt': 'Tipo de indicador',
         'label:fr': "Type d'indicateur",
         'label:it': 'Tipo di indicatore',
         'label:tr': 'Varsayılan göstergeyi değiştir',
         'label:de': 'Indikatortyp',
         'label:pl': 'Typ wskaźnika',
         options: [
            { label: 'text-top', value: 'text-top', selected: true },
            { label: 'bar-top', value: 'bar-top' },
            { label: 'bar-center', value: 'bar-center' },
            { label: 'bar-vertical', value: 'bar-vertical' },
         ],
      },
      player_indicator_color: {
         _tagName: 'input',
         label: 'Color',
         type: 'color',
         value: '#ff0000', // red
         'data-dependent': { 'player_indicator_type': '!text-top' },
      },
   }
});
