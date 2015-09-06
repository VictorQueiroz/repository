## Context

The context must be updated by the `Repository`.

It listens the `update` events emitted by `QueryBuilder` and propagates the event inside the instance. `Repository` listen to the `update` event, perform a `find` and update the context data with the data provived by the `DataProvider`.