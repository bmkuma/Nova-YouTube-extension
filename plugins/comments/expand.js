window.nova_plugins.push({
   id: 'comments-expand',
   title: 'Expand comments',
   'title:zh': '展开评论',
   'title:ja': 'コメントを展開',
   'title:ko': '댓글 펼치기',
   'title:id': 'Perluas komentar',
   'title:es': 'Expandir comentarios',
   'title:pt': 'Expandir comentários',
   'title:fr': 'Développer les commentaires',
   'title:it': 'Espandi i commenti',
   'title:tr': 'Yorumları genişlet',
   'title:de': 'Kommentare erweitern',
   'title:pl': 'Rozwiń komentarze',
   run_on_pages: 'watch, -mobile',
   section: 'comments',
   // desc: '',
   _runtime: user_settings => {

      // Doesn't work. I don't know how to implement it better. By updating "removeEventListener/addEventListener" or reloading the entire comment block
      // dirty fix bug with not updating comments addEventListener: reset comments block
      // document.addEventListener('yt-page-data-updated', () => location.reload());

      NOVA.css.push(
         `/* fixs */
         #expander.ytd-comment-renderer {
            overflow-x: hidden;
         }`);

      // comment
      NOVA.watchElements({
         selectors: ['#contents #expander[collapsed] #more:not([hidden])'],
         attr_mark: 'comment-expanded',
         callback: btn => {
            const moreExpand = () => btn.click();
            const comment = btn.closest('#expander[collapsed]');
            // console.debug('contents expander:', comment);
            // comment.style.border = '2px solid red'; // mark for test

            // on hover auto expand
            switch (user_settings.comments_expand_mode) {
               case 'onhover':
                  comment.addEventListener('mouseenter', moreExpand, { capture: true, once: true });
                  break;

               // case 'always':
               default:
                  moreExpand();
                  break;
            }
         },
      });

      // comment replies
      NOVA.watchElements({
         selectors: ['#more-replies button'],
         attr_mark: 'replies-expanded',
         callback: btn => {
            const moreExpand = () => btn.click();

            // on hover auto expand
            switch (user_settings.comments_view_reply) {
               case 'onhover':
                  btn.addEventListener('mouseenter', moreExpand, { capture: true, once: true });
                  break;

               // case 'always':
               default:
                  moreExpand();
                  break;
            }
         },
      });

      // old method. No hover
      // NOVA.watchElements({
      //    selector: ['#contents #expander[collapsed] #more'],
      //    attr_mark: 'comment-expanded',
      //    callback: btn => btn.click(),
      // });

      // if (user_settings.comments_view_reply) {
      //    NOVA.watchElements({
      //       selector: ['#comment #expander #more-replies'],
      //       attr_mark: 'replies-expanded',
      //       callback: btn => btn.click(),

      //    });
      // }

   },
   options: {
      comments_expand_mode: {
         _tagName: 'select',
         label: 'Expand comment',
         'label:zh': '展开评论',
         'label:ja': 'コメントを展開',
         'label:ko': '댓글 펼치기',
         'label:id': 'Perluas komentar',
         'label:es': 'Expandir comentarios',
         'label:pt': 'Expandir comentário',
         'label:fr': 'Développer les commentaires',
         'label:it': 'Espandi commento',
         'label:tr': 'Yorumu genişlet',
         'label:de': 'Kommentar erweitern',
         'label:pl': 'Rozwiń komentarz',
         // title: '',
         options: [
            { label: 'always', value: 'always', selected: true, 'label:zh': '每次', 'label:ja': 'いつも', 'label:ko': '언제나', /*'label:id': '',*/ 'label:es': 'siempre', 'label:pt': 'sempre', 'label:fr': 'toujours', /*'label:it': '',*/ 'label:tr': 'her zaman', 'label:de': 'stets', 'label:pl': 'zawsze' },
            { label: 'on hover', value: 'onhover', 'label:zh': '悬停时', 'label:ja': 'ホバー時に', 'label:ko': '호버에',/*'label:id': '',*/ 'label:es': 'en vuelo estacionario', 'label:pt': 'pairando', 'label:fr': 'en vol stationnaire', /*'label:it': '',*/ 'label:tr': 'üzerinde gezinme', 'label:de': 'auf schweben', 'label:pl': 'po najechaniu', },
         ],
      },
      comments_view_reply: {
         _tagName: 'select',
         label: 'Expand reply',
         'label:zh': '展开回复',
         'label:ja': '返信を展開',
         'label:ko': '답장 펼치기',
         'label:id': 'Perluas balasan',
         'label:es': 'Expandir respuesta',
         'label:pt': 'Expandir a resposta',
         'label:fr': 'Développer la réponse',
         'label:it': 'Espandi risposta',
         'label:tr': 'Cevabı genişlet',
         'label:de': 'Antwort erweitern',
         'label:pl': 'Rozwiń odpowiedź',
         // title: '',
         options: [
            { label: 'always', value: 'always', 'label:zh': '每次', 'label:ja': 'いつも', 'label:ko': '언제나', 'label:id': 'selalu', 'label:es': 'siempre', 'label:pt': 'sempre', 'label:fr': 'toujours', 'label:it': 'sempre', 'label:tr': 'her zaman', 'label:de': 'stets', 'label:pl': 'zawsze' },
            { label: 'on hover', value: 'onhover', selected: true, 'label:zh': '悬停时', 'label:ja': 'ホバー時に', 'label:ko': '호버에', /*'label:id': '',*/ 'label:es': 'en vuelo estacionario', 'label:pt': 'pairando', 'label:fr': 'en vol stationnaire', /*'label:it': '',*/ 'label:tr': 'üzerinde gezinme', 'label:de': 'auf schweben', 'label:pl': 'przy najechaniu' },
         ],
      },
   }
});
