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
        path: path,
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
      ? treeObjectView(state.path, subtree.children)
      : blobObjectView(subtree.contents)

    return (
      <div className="filetree-wrapper container">
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
        return <a className="link" href={"#"+pathSegment.prefix}>{pathSegment.segment}</a>;
      } else {
        return <span>{pathSegment.segment}</span>;
      }
    });
    const breadcrumbSeparator = () => <span className="separator"> / </span>;
    breadcrumbSpans = [].concat(
      ...breadcrumbPathSegments.map(seg => [breadcrumbSeparator(), seg]));
  }

  return (
    <div className="filetree-nav row">
      { breadcrumbSpans &&
        <div className="breadcrumbs">
          <a href="#/" className="home-link">
            <i className="link fa fa-home" aria-hidden="true"></i>
          </a>
          {breadcrumbSpans}
        </div>
      }
    </div>
  );
}

// TODO: rename this so it doesnt use names of git internals?
function treeObjectView(path, treeEntries) {
  let subtreeList = [];
  for (const [name, props] of Object.entries(treeEntries)) {
    subtreeList.push({'name': name, 'type': props.type});
  }
  const filesList = subtreeList.map(f => {
    const iconClass = f.type === 'file' ? 'fa-file-text-o' : 'fa-folder';
    const pathPrefix = path === '/' ? '#/' : '#' + path + '/';
    const fLink = pathPrefix + f.name;
    return (
      <tr className="navigation">
        <td className="icon"><i className={'fa '+iconClass} aria-hidden="true"></i></td>
        <td><a href={fLink}>{f.name}</a></td>
      </tr>
    );
  });

  let doubleDotRow = null;
  if (path !== '/') {
    const parentPath = path.substr(0, path.lastIndexOf('/'));
    doubleDotRow = (
      <tbody>
        <tr className="navigation">
          <td className="icon"></td>
          <td><a href={'#'+parentPath}>..</a></td>
        </tr>
      </tbody>
    );
  }

  return (
    <table className="tree-view row u-full-width">
      { doubleDotRow }
      <tbody>
        {filesList}
      </tbody>
    </table>
  );
}

function blobObjectView(contents) {
  return (
    <div className="blob-view row">
      <pre>
        {contents}
      </pre>
    </div>
  );
}
