import xs from 'xstream'

export function App (sources) {
  function newFile(name) {
    return {'type': 'file', 'name': name}
  }
  function newFolder(name) {
    return {'type': 'folder', 'name': name}
  }
  const state$ = xs.of([newFile('foo'),
                        newFolder('bar'),
                        newFile('baz')]);
  return {
    DOM: view(state$)
  }
}

function view(state$) {
  return state$.map(files => {
    const filesList = files.map(f => {
      const iconClass = f.type === 'file' ? 'fa-file-text-o' : 'fa-folder';
      return (
        <tr>
          <td><i className={'fa '+iconClass} aria-hidden="true"></i></td>
          <td>{f.name}</td>
        </tr>
      );
    });
    return (
      <table>
        {filesList}
      </table>
    );
  });
}
