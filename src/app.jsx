import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats';
import {Filetree} from './filetree'

export function App (sources) {
  const filetreeEntryHistory$ = sources.history.map(history => {
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
      });
  })
  .flatten();

  const breadcrumbsHistory$ = sources.DOM.select('.breadcrumbs > .link').events('click')
    .map(ev => {
      const datasetFilepath = ev.target.dataset.filepath;
      if (datasetFilepath) {
        return datasetFilepath;
      } else {
        return '/';
      }
  });

  const history$ = xs.merge(filetreeEntryHistory$, breadcrumbsHistory$);

  const subsubtree = {'brr-brr-brr': {'type': 'file', 'contents': 'depends'},
                      'blues-clues': {'type': 'folder', 'children': {}}};

  const subtree = {'hi_there': {'type': 'file', 'contents': 'see for yourself'},
                   'face_here': {'type': 'folder',
                                 'children': subsubtree}};
  const filetreeData = {'foo': {'type': 'file', 'contents': 'AAAAA'},
                    'bar': {'type': 'folder', 'children': subtree},
                    'baz': {'type': 'file', 'contents': 'be kind'}};
  const props$ = xs.of({'fileTree': filetreeData});

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
