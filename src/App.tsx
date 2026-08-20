import { Navigate, Route, Router } from "@solidjs/router"

import Trains from "./pages/Trains"

function App() {
  return (
    <Router>
      <Route path="/" component={() => <Navigate href="/trains" />} />
      <Route path="/trains" component={Trains} />
      <Route path="/trains/:trainId" component={Trains} />
      <Route path="*" component={() => <Navigate href="/trains" />} />
    </Router>
  )
}

export default App
