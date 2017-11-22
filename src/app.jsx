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

  const subtree = {'hi_there': {'type': 'file'},
                   'face_here': {'type': 'folder',
                                 'children': {'brr-brr-brr': {'type': 'file'}}}};
  const filetreeData = {'foo': {'type': 'file'},
                    'bar': {'type': 'folder', 'children': subtree},
                    'baz': {'type': 'file'}};
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
