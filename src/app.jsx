import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats';

export function App (sources) {
  const history$ = sources.DOM.select('span.nav-link').events('click')
    .map(ev => ev.target.dataset.filepath || "/")
    .compose(dropRepeats());

  const subtree = {'hi_there': {'type': 'file'},
                   'face_here': {'type': 'file'}};
  const filetree = {'foo': {'type': 'file'},
                    'bar': {'type': 'folder', 'children': subtree},
                    'baz': {'type': 'file'}};
  const state$ = xs.of({'filetree': filetree});
  return {
    DOM: view(state$, sources.history),
    history: history$,
  }
}

function traverseToSubtree(path, filetree) {
  if (path === '/') {
    return filetree;
  }
  const pathSegments = path.slice(1).split('/');
  let subtree = filetree;
  for (const pathSegment of pathSegments) {
    const subEntry = subtree[pathSegment];
    if (subEntry.type === 'folder') {
      subtree = subEntry.children;
    } else {
      throw new Error("Viewing blobs is currently unimplemented");
    }
  }
  return subtree;
}

function view(state$, history$) {
  return history$.map(history => {
    const {pathname} = history;
    return state$.map(state => {
      const subtree = traverseToSubtree(pathname, state.filetree);
      let subtreeList = [];
      for (const [name, props] of Object.entries(subtree)) {
        subtreeList.push({'name': name, 'type': props.type});
      }
      const filesList = subtreeList.map(f => {
        function nameToFullPath(pathname, name) {
          if (pathname === '/') {
            return name;
          } else {
            return pathname + '/' + f.name;
          }
        }
        const iconClass = f.type === 'file' ? 'fa-file-text-o' : 'fa-folder';
        return (
          <tr className="navigation">
            <td><i className={'fa '+iconClass} aria-hidden="true"></i></td>
            <td><span className="nav-link" data-filepath={nameToFullPath(pathname, f.name)}>{f.name}</span></td>
          </tr>
        );
      });
      return (
        <table className="filetree">
          <tbody>
            { pathname !== '/' &&
              <tr className="navigation">
                <td></td>
                <td><span className="nav-link">..</span></td>
              </tr>
            }
          </tbody>
          <tbody>
            {filesList}
          </tbody>
        </table>
      );
    });
  }).flatten();
}
