import xs from 'xstream'

export function Filetree(sources) {
  const filetreeNavSources = {
    history: sources.history
  };
  const filetreeNav = FiletreeNav(filetreeNavSources);

  return {
    DOM: view(sources.props, sources.history, filetreeNav.DOM)
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

function view(props$, history$, filetreeNavVDom$) {
  return props$.map(branch => {
    return xs.combine(history$, filetreeNavVDom$).map(([history, filetreeNavVDom]) => {
      const {pathname} = history;
      const subtree = traverseToSubtree(pathname, branch.filetree);
      let subtreeList = [];
      for (const [name, props] of Object.entries(subtree)) {
        subtreeList.push({'name': name, 'type': props.type});
      }
      const filesList = subtreeList.map(f => {
        const iconClass = f.type === 'file' ? 'fa-file-text-o' : 'fa-folder';
        return (
          <tr className="navigation">
            <td><i className={'fa '+iconClass} aria-hidden="true"></i></td>
            <td><span className="nav-link" data-filename={f.name}>{f.name}</span></td>
          </tr>
        );
      });

      return (
        <div>
          {filetreeNavVDom}
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
        </div>
      );
    });
  }).flatten();
}

function FiletreeNav(sources) {
  const vdom$ = sources.history.map(history => {
    const {pathname} = history;
    // TODO: de-duplicate with path-splitting code in traverseToSubtree?
    let breadcrumbSpans;
    if (pathname !== '/') {
      const breadcrumbPathSegments = pathname.slice(1).split('/').map(pathSegment =>
        <span className="path-segment">{pathSegment}</span>
      );
      const breadcrumbSeparator = <span className="separator">/</span>;
      breadcrumbSpans = [].concat(
        ...breadcrumbPathSegments.map(seg => [breadcrumbSeparator, seg]));
    }
    return (
      <div className="filetreeNav">
        { breadcrumbSpans &&
          <div className="breadcrumbs">
            <i className="fa fa-home" aria-hidden="true"></i>
            {breadcrumbSpans}
          </div>
        }
      </div>
    );
  });
  return {
    DOM: vdom$,
  }
}