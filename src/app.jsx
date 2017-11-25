import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats';
import {Filetree} from './filetree'

const demoCommitHash = "z8mWaFhg8TJBrcjq3FtHq92Y6TsqzhNs7";

export function App (sources) {
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
    DOM: filetreeVDom$
  }
}
