// for test
// https://www.youtube.com/channel/UC9qr4fem8L5HEx0IDoktEpw/videos - many live
// https://www.youtube.com/channel/UCOJPgtKYrDrTjbn7rLRHfTQ/videos - many live
// https://www.youtube.com/channel/UCIjYyZxkFucP_W-tmXg_9Ow/videos - no sort
// https://www.youtube.com/channel/UCT41vlFeZ_asAUCY7BOiJVQ/videos - no sort
// https://www.youtube.com/channel/UC2yGvqVB_kK0FC1eUifENGQ/videos - no sort
// https://www.youtube.com/channel/UCHzevlEL9JfsBIm86uNCJqg/videos - no sort
// https://www.youtube.com/channel/UCcYrdFJF7hmPXRNaWdrko4w/videos - no sort

window.nova_plugins.push({
   id: 'thumbs-sort',
   title: 'Add button to sort thumbnails by views',
   'title:zh': '添加按钮以按视图对缩略图进行排序',
   'title:ja': 'ビューでサムネイルを並べ替えるボタンを追加',
   'title:ko': '보기별로 축소판을 정렬하는 추가 버튼',
   'title:id': 'Tambahkan tombol untuk mengurutkan gambar mini berdasarkan tampilan',
   'title:es': 'Agregar botón para ordenar las miniaturas por vistas',
   'title:pt': 'Botão Adicionar para classificar miniaturas por visualizações',
   'title:fr': 'Ajouter un bouton pour trier les vignettes par vues',
   'title:it': 'Pulsante Aggiungi per ordinare le miniature in base alle visualizzazioni',
   'title:tr': 'Küçük resimleri görünümlere göre sıralamak için Ekle düğmesi',
   'title:de': 'Schaltfläche "Hinzufügen", um Miniaturansichten nach Ansichten zu sortieren',
   'title:pl': 'Dodaj przycisk sortowania miniatur według wyświetleń',
   run_on_pages: 'channel, -mobile',
   // restart_on_transition: true, // dirty fix. required to use. But for optimization it is disabled and the code is not adapted
   section: 'other',
   desc: 'The "sort video button" in some Youtube channels (usually Music channels) has disabled this feature.',
   _runtime: user_settings => {

      // alt1 - https://greasyfork.org/en/scripts/450761-sort-menu-for-arist-channels-on-youtube
      // alt2 - https://greasyfork.org/en/scripts/383420-youtube-uploads-sorter-button
      // alt3 - https://greasyfork.org/en/scripts/437318-sort-youtube-videos
      // Strategy 1
      NOVA.waitElement('#sub-menu #sort-menu:empty') // if default sort by is empty
         .then(container => {
            container.innerHTML =
               `<select onchange="location=this.value;">
                  <option disabled selected value>SORT BY</option>
                  <option value="?view=0&sort=p&flow=grid">Most popular</option>
                  <option value="?view=0&sort=da&flow=grid">Date added (oldest)</option>
                  <option value="?view=0&sort=dd&flow=grid">Date added (newest)</option>
               </select>`;
         });

      // Strategy 2
      // NOVA.waitElement('#sub-menu #sort-menu:empty') // if default sort by is empty
      //    .then(container => {
      //       const sortBtn = document.createElement('button');
      //       sortBtn.textContent = 'Sort by Views';
      //       Object.assign(sortBtn.style, {
      //          'user-select': 'none',
      //          cursor: 'pointer',
      //       });
      //       sortBtn.addEventListener('click', () => {
      //          if (container = document.body.querySelector('#contents #items')) {
      //             container.append(...Array.from(container.childNodes).sort(sortBy));

      //          } else console.error('sortBtn container items is empty');
      //       });
      //       container.append(sortBtn);
      //    });

      // function sortBy(a = required(), b = required()) {
      //    // switch (sortBy_type) {
      //    //    case 'views':
      //    return getViews(b) - getViews(a);

      //    function getViews(e) {
      //       // const views = e.querySelector('a[aria-label]')?.getAttribute('aria-label') // #metadata
      //       const views = e.$['video-title']?.getAttribute('aria-label')
      //          ?.match(/([\d,]+) views/);

      //       return views && views[1] ? +views[1].replace(/,/g, '') : 0;
      //       // return views && views[1] ? parseInt(views[1].replace(/,/g, '')) : 0;
      //    }
      //    //    break;

      //    //    default:
      //    //       break;
      //    // }
      // }

      if (user_settings.thumbs_sort_streams_ahead) {
         // alt - https://greasyfork.org/en/scripts/433860-yt-feed-sorter
         NOVA.waitElement('ytd-grid-video-renderer')
            .then(async () => {
               const
                  liveSelector = '#thumbnail img[src*="_live.jpg"]',
                  premieresSelector =
                     `#thumbnail #overlays [aria-label="Premiere"],
                     #thumbnail #overlays [aria-label="Upcoming"]`;

               // wait all stream
               await NOVA.waitUntil(() => document.body.querySelectorAll(liveSelector).length > 1, 500);

               if (container = document.body.querySelector('#page-manager #primary #items')) {
                  container.append(...Array.from(container.childNodes).sort(sortByStream));
               }

               function sortByStream(a, b) {
                  const ai = a.querySelector(liveSelector) ? 2 : a.querySelector(premieresSelector) ? 1 : 0;
                  const bi = b.querySelector(liveSelector) ? 2 : b.querySelector(premieresSelector) ? 1 : 0;
                  return (ai > bi) ? -1 : (ai < bi) ? 1 : 0;
               }
            });
      }
   },
   options: {
      thumbs_sort_streams_ahead: {
         _tagName: 'input',
         label: 'Streams and premiere is first',
         'label:zh': '流媒体和首映是第一',
         'label:ja': 'ストリームとプレミアが最初です',
         'label:ko': '스트림 및 프리미어가 먼저입니다.',
         'label:id': 'Streaming dan premier adalah yang pertama',
         'label:es': 'Corrientes y estrenos es la primera',
         'label:pt': 'Streams e estreias é o primeiro',
         'label:fr': 'Les flux et les premières sont les premiers',
         'label:it': 'Stream e premiere sono i primi',
         'label:tr': 'Akışlar ve prömiyerler ilk sırada',
         'label:de': 'Streams und Premieren stehen an erster Stelle',
         'label:pl': 'Streamy i premiery jako pierwsze',
         type: 'checkbox',
      },
   }
});
