window.nova_plugins.push({
   id: 'thumbs-title-filter',
   title: 'Block thumbnails by title',
   'title:zh': '按标题阻止缩略图',
   'title:ja': 'タイトルでサムネイルをブロックする',
   'title:ko': '제목으로 축소판 차단',
   'title:id': 'Blokir gambar mini berdasarkan judul',
   'title:es': 'Bloquear miniaturas por título',
   'title:pt': 'Bloquear miniaturas por título',
   'title:fr': 'Bloquer les vignettes par titre',
   'title:it': 'Blocca le miniature per titolo',
   'title:tr': 'Küçük resimleri başlığa göre engelle',
   'title:de': 'Thumbnails nach Titel blockieren',
   'title:pl': 'Blokuj miniatury według tytułu',
   run_on_pages: 'all, -embed, -mobile',
   section: 'other',
   // desc: '',
   _runtime: user_settings => {

      const keywords = user_settings.thumb_filter_title_blocklist
         ?.split(/[\n,;]/)
         .map(e => e.toString().trim().toLowerCase())
         .filter(e => e.length);

      const thumbsSelectors = [
         'ytd-rich-item-renderer', // home
         'ytd-video-renderer', // results
         'ytd-grid-video-renderer', // feed, channel
         'ytd-compact-video-renderer', // sidepanel in watch
         'ytm-compact-video-renderer', // mobile
      ]
         .join(',');

      // Strategy 1. More optimize.
      // page update
      document.addEventListener('yt-action', evt => {
         // console.log(evt.detail?.actionName);
         if ([
            'yt-append-continuation-items-action', // home, results, feed, channel, watch
            'ytd-update-grid-state-action', // feed, channel
            'yt-service-request', // results, watch
            // 'ytd-rich-item-index-update-action', // home
         ]
            .includes(evt.detail?.actionName)
         ) {
            hideThumb();
         }
      });

      function hideThumb() {
         document.body.querySelectorAll('#video-title')
            .forEach(el => {
               keywords.forEach(keyword => {
                  if (el.textContent.toLowerCase().includes(keyword) && (thumb = el.closest(thumbsSelectors))) {
                     thumb.remove();
                     // thumb.style.display = 'none';

                     // console.log('filter removed', keyword, thumb);
                     // thumb.style.border = '2px solid orange'; // mark for test
                  }
               });
            });
      }

      // NOVA.watchElements({
      //    selectors: [
      //       'ytd-rich-item-renderer', // home
      //       'ytd-video-renderer', // results
      //       'ytd-grid-video-renderer', // feed, channel
      //       'ytd-compact-video-renderer', // sidepanel in watch
      //       'ytm-compact-video-renderer', // mobile
      //    ],
      //    attr_mark: 'thumb-title-filtered',
      //    callback: thumb => {
      //       keywords.forEach(keyword => {
      //          if (thumb.querySelector('#video-title')?.textContent.toLowerCase().includes(keyword)) {
      //             thumb.remove();
      //             // thumb.style.border = '2px solid orange'; // mark for test
      //             // console.log('filter removed', keyword, thumb);
      //          }
      //       });
      //    }
      // });

   },
   options: {
      thumb_filter_title_blocklist: {
         _tagName: 'textarea',
         label: 'Words list',
         'label:zh': '单词列表',
         'label:ja': '単語リスト',
         'label:ko': '단어 목록',
         'label:id': 'Daftar kata',
         'label:es': 'lista de palabras',
         'label:pt': 'Lista de palavras',
         'label:fr': 'Liste de mots',
         'label:it': 'Elenco di parole',
         'label:tr': 'Kelime listesi',
         'label:de': 'Wortliste',
         'label:pl': 'Lista słów',
         title: 'separator: "," or ";" or "new line"',
         'title:zh': '分隔器： "," 或 ";" 或 "新队"',
         'title:ja': 'セパレータ： "," または ";" または "改行"',
         'title:ko': '구분 기호: "," 또는 ";" 또는 "새 줄"',
         'title:id': 'pemisah: "," atau ";" atau "baris baru"',
         'title:es': 'separador: "," o ";" o "new line"',
         'title:pt': 'separador: "," ou ";" ou "new line"',
         'title:fr': 'séparateur : "," ou ";" ou "nouvelle ligne"',
         'title:it': 'separatore: "," o ";" o "nuova linea"',
         'title:tr': 'ayırıcı: "," veya ";" veya "new line"',
         'title:de': 'separator: "," oder ";" oder "new line"',
         'title:pl': 'separator: "," lub ";" lub "now linia"',
         placeholder: 'text1, text2',
         required: true,
      },
   }
});
