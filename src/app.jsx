import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats';
import {Filetree} from './filetree'

export function App (sources) {
  const history$ = sources.history.map(history => {
    return sources.DOM.select('span.nav-link').events('click')
      .map(ev => {
          const {pathname} = history;
          const datasetFilename = ev.target.dataset.filename;
          if (pathname === '/') {
            return '/'+datasetFilename;
          } else {
            if (datasetFilename) {
              return pathname+'/'+datasetFilename;
            } else {
              return pathname.substr(0, pathname.lastIndexOf('/'));
            }
          }
      })
      .compose(dropRepeats());
  })
  .flatten();

  const subtree = {'hi_there': {'type': 'file'},
                   'face_here': {'type': 'folder',
                                 'children': {'brr-brr-brr': {'type': 'file'}}}};
  const filetreeData = {'foo': {'type': 'file'},
                    'bar': {'type': 'folder', 'children': subtree},
                    'baz': {'type': 'file'}};
  const props$ = xs.of({'filetree': filetreeData});

  const filetreeSources = {
    DOM: sources.DOM,
    history: sources.history,
    props: props$,
  };
  const filetree = Filetree(filetreeSources);
  const filetreeVDom$ = filetree.DOM;
  return {
    DOM: filetreeVDom$,
    history: history$,
  }
}
