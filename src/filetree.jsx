import xs from 'xstream'

export function Filetree(sources) {
  const actions = intent(sources.history);
  const state$ = model(actions, sources.props);

  return {
    DOM: view(state$)
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

function view(state$) {
  return state$.map(state => {
    const filetreeNavVDom = navView(state.pathSegments);
    const subtree = traverseToSubtree(state.pathSegments, state.fileTree);
    const subtreeView = subtree.type === 'folder'
      ? treeObjectView(state, subtree.children)
      : <div>{subtree.contents}</div>;

    return (
      <div>
        {filetreeNavVDom}
        {subtreeView}
      </div>
    );
  });
}

// fileTree is a JS object whose keys are (immediate) children in the file tree,
// values are an object representing either:
//   - a file: {'type': 'file', 'contents': <file contents>}
//   - a folder: {'type': 'folder', 'children': <file tree>}
function traverseToSubtree(pathSegments, fileTree) {
  let subtree = {'type': 'folder', 'children': fileTree};
  for (const pathSegment of pathSegments) {
    subtree = subtree.children[pathSegment];
  }
  return subtree;
}

function navView(pathSegments) {
  let breadcrumbSpans;
  if (pathSegments.length !== 0) {
    // turn `/foo/bar/baz` into
    // [{segment: 'foo', prefix: '/foo'},
    //  {segment: 'bar', prefix: '/foo/bar'},
    //  {segment: 'baz', prefix: '/foo/bar/baz'}]
    // The path prefix will be used for the link of each segment
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
}

// TODO: rename this so it doesnt use names of git internals?
function treeObjectView(state, treeEntries) {
  const pathIsRoot = state.pathSegments.length === 0;
  let subtreeList = [];
  for (const [name, props] of Object.entries(treeEntries)) {
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
  );
}
