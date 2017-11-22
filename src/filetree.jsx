import xs from 'xstream'

export function Filetree(sources) {
  const filetreeNavSources = {
    history: sources.history
  };
  const filetreeNav = FiletreeNav(filetreeNavSources);

  const actions = intent(sources.history);
  const state$ = model(actions, sources.props);

  return {
    DOM: view(state$, filetreeNav.DOM)
  }
}

function intent(historySource) {
  return {
    changePath$: historySource.map(location => location.pathname)
  }
}

function model(actions, props$) {
  return xs.combine(actions.changePath$, props$)
    .map(([path, props]) => {
      const pathSegments = path === '/' ? [] : path.slice(1).split('/');
      return {
        pathSegments: pathSegments,
        fileTree: props.fileTree
      }
    });
}

function traverseToSubtree(pathSegments, filetree) {
  if (pathSegments.length === 0) {
    return filetree;
  }
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

function view(state$, filetreeNavVDom$) {
  return xs.combine(state$, filetreeNavVDom$).map(([state, filetreeNavVDom]) => {
    const pathIsRoot = state.pathSegments.length === 0;
    const subtree = traverseToSubtree(state.pathSegments, state.fileTree);
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
            { !pathIsRoot &&
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
}

function FiletreeNav(sources) {
  const vdom$ = sources.history.map(history => {
    const {pathname} = history;
    // TODO: de-duplicate with path-splitting code in traverseToSubtree?
    let breadcrumbSpans;
    if (pathname !== '/') {
      // turn `/foo/bar/baz` into
      // [{segment: 'foo', prefix: '/foo'},
      //  {segment: 'bar', prefix: '/foo/bar'},
      //  {segment: 'baz', prefix: '/foo/bar/baz'}]
      // The path prefix will be used for the link of each segment
      const pathSegments = pathname.slice(1).split('/');
      let prefix = '';
      let pathSegmentsPrefixes = [];
      for (const segment of pathSegments) {
        prefix += '/' + segment;
        pathSegmentsPrefixes.push({segment: segment, prefix: prefix});
      }
      const lastSegment = pathSegments.length - 1;
      const breadcrumbPathSegments = pathSegmentsPrefixes.map((pathSegment, i) => {
        if (i < lastSegment) {
          return <span className="link" data-filepath={pathSegment.prefix}>{pathSegment.segment}</span>;
        } else {
          return <span>{pathSegment.segment}</span>;
        }
      });
      const breadcrumbSeparator = <span className="separator"> / </span>;
      breadcrumbSpans = [].concat(
        ...breadcrumbPathSegments.map(seg => [breadcrumbSeparator, seg]));
    }
    return (
      <div className="filetreeNav">
        { breadcrumbSpans &&
          <div className="breadcrumbs">
            <i className="link fa fa-home" aria-hidden="true"></i>
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
