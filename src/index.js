import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {makeHashHistoryDriver} from '@cycle/history';
import {App} from './app'

const main = App

const drivers = {
  DOM: makeDOMDriver('#root'),
  history: makeHashHistoryDriver(),
}

run(main, drivers)
